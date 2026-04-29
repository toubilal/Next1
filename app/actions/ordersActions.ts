'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ipRequests = new Map<string, number[]>()

function rateLimit(ip: string) {
  const now = Date.now()
  const windowMs = 60_000
  const limit = 3

  const requests = ipRequests.get(ip) || []
  const recent = requests.filter(t => now - t < windowMs)

  if (recent.length >= limit) {
    throw new Error('Too many requests')
  }

  recent.push(now)
  ipRequests.set(ip, recent)
}

function sanitize(input: string) {
  return input.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim()
}

function validatePhone(phone: string) {
  return /^[0-9]{7,8}$/.test(phone)
}

function validateName(name: string) {
  const parts = name.trim().split(' ')
  return parts.length >= 2 && parts.every(p => p.length >= 2)
}

async function verifyCaptcha(token: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY!

  const res = await fetch(
    'https://www.google.com/recaptcha/api/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    }
  )

  const data = await res.json()
  return data.success
}

export async function submitOrderAction(cart, customerInfo, captchaToken, ip: string) {

  // 🔒 1. rate limit
  rateLimit(ip)

  // 🛒 2. cart check
  if (!cart || cart.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  // 👤 3. validation
  if (!validateName(customerInfo.fullName)) {
    return { success: false, error: 'Invalid name' }
  }

  if (!validatePhone(customerInfo.phone)) {
    return { success: false, error: 'Invalid phone' }
  }

  // 🤖 4. CAPTCHA check early
  if (!captchaToken) {
    return { success: false, error: 'Captcha required' }
  }

  const captchaOk = await verifyCaptcha(captchaToken)
  if (!captchaOk) {
    return { success: false, error: 'Captcha failed' }
  }

  // 🧼 5. sanitize
  customerInfo.fullName = sanitize(customerInfo.fullName)
  customerInfo.address = sanitize(customerInfo.address)

  // 🧠 6. product validation (FIXED)
  const productIds = cart.map(item => item.id)

  const { data: products, error: productError } = await supabaseAdmin
    .from('products')
    .select('id')
    .in('id', productIds)

  if (productError) {
    return { success: false, error: 'Product check failed' }
  }

  const validIds = new Set(products.map(p => p.id))
  const invalid = productIds.filter(id => !validIds.has(id))

  if (invalid.length > 0) {
    return { success: false, error: 'Invalid product detected' }
  }

  // 🧠 7. order id
  const orderGroupId = Math.random().toString(36).substring(2, 8).toUpperCase()

  // 📦 8. build orders
  const ordersToInsert = cart.map(item => ({
    order_id: orderGroupId,
    product_id: item.id,
    customer_name: customerInfo.fullName,
    customer_phone: customerInfo.phone,
    customer_address: customerInfo.address,
    selectedOptions: item.selectedOptions,
    quantity: item.quantityCart || 1,
    status: 'pending',
    created_at: new Date().toISOString()
  }))

  // 💾 9. insert
  const { error } = await supabaseAdmin
    .from('orders')
    .insert(ordersToInsert)

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    orderId: orderGroupId
  }
}