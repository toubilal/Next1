'use server' // هذا السطر يحول كل الدوال في الملف إلى Server Actions
import { createClient } from '@supabase/supabase-js' // يفضل استخدام نسخة السيرفر هنا

// إعداد عميل السوبابيس للسيرفر (باستخدام مفتاح الخدمة أو اليوزر)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // هذا سيقرأ القيمة 'sb_secret_...' من ملفك
)


// 1. إضافة منتج (Server Action)
export async function addProductAction(payload: any) {
  // هنا نقوم بترجمة الحقول من الواجهة إلى أسماء الأعمدة المخفية في قاعدة البيانات
  const { data, error } = await supabaseAdmin
    .from('sys_data_node_77') // اسم الجدول الحقيقي المخفي
    .insert([{
      "Title": payload.Title,
      "Price": payload.Price,
      "Image": payload.Image,
      category: payload.category,
      field_desc: payload.Description, // ترجمة الاسم
      extra_payload: payload.options,  // ترجمة الاسم
      prev_price: payload.old_price,   // ترجمة الاسم
      qty_level: payload.stock_quantity, // ترجمة الاسم
      status: 'active'
    }])
    .select();

  return { error: error?.message, data };
}

// 2. تحديث منتج
export async function updateProductAction(id: number, payload: any) {
  const { data, error } = await supabaseAdmin
    .from('sys_data_node_77')
    .update({
        "Title": payload.Title,
        "Price": payload.Price,
        field_desc: payload.Description,
        extra_payload: payload.options,
        // أضف بقية الحقول التي تريد تحديثها
    })
    .eq('id', id)
    .select();

  return { error: error?.message, data };
}

// 3. حذف منتج
export async function deleteProductAction(id: number) {
  const { error } = await supabaseAdmin
    .from('sys_data_node_77')
    .delete()
    .eq('id', id);
  
  return { error: error?.message };
}
// جلب جميع المنتجات للوحة التحكم
export async function getAllProductsForAdmin() {
  const { data, error } = await supabaseAdmin
    .from('sys_data_node_77') // الجدول الحقيقي
    .select('*')             // جلب كل الأعمدة بما فيها views و likes_count
    .order('id', { ascending: false }); // ترتيب من الأحدث للأقدم

  if (error) {
    console.error("Admin Fetch Error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
// جلب تفاصيل منتج واحد كاملة للأدمن
// جلب جميع منتجات صنف معين باستثناء ID واحد (للأدمن)
export async function getFullCategoryProducts(categoryName: string, excludeId: number) {
  const { data, error } = await supabaseAdmin
    .from('sys_data_node_77')
    .select('*') // جلب كل التفاصيل (views, likes, qty_level...)
    .eq('category', categoryName)
    .neq('id', excludeId)
    .order('id', { ascending: false }); // ترتيب من الأحدث للأقدم

  if (error) {
    console.error("Admin Full Category Fetch Error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
// جلب تفاصيل منتج واحد كاملة للأدمن
export async function getAdminProductById(id: number) {
  const { data, error } = await supabaseAdmin
    .from('sys_data_node_77')
    .select('*')
    .eq('id', id)
    .single(); // جلب كائن واحد فقط

  if (error) {
    console.error("Admin Fetch ID Error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
