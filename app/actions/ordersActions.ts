'use server'

import { createClient } from '@supabase/supabase-js' 

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // هذا سيقرأ القيمة 'sb_secret_...' من ملفك
)

export async function submitOrderAction(cart, customerInfo) {
  // 1. توليد رقم موحد لهذه السلة (6 خانات كما اتفقنا)
  const orderGroupId = Math.random().toString(36).substring(2, 8).toUpperCase();

  // 2. تجهيز البيانات
  const ordersToInsert = cart.map(item => ({
    order_id: orderGroupId,        // العمود الجديد لربط المنتجات ببعضها
    product_id: item.id,
    customer_name: customerInfo.fullName,
    customer_phone: customerInfo.phone,
    quantity: item.quantity || 1,
    customer_address: customerInfo.address,
    status: 'pending',             // الحالة الابتدائية: قيد الطلب
    created_at: new Date()         // وقت الطلب
  }));

  const { error } = await supabaseAdmin
    .from('orders')
    .insert(ordersToInsert);

  if (error) return { success: false, error: error.message };
  
  return { success: true, orderId: orderGroupId };
}