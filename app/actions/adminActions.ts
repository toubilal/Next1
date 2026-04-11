'use server' // هذا السطر يحول كل الدوال في الملف إلى Server Actions
import { createClient } from '@supabase/supabase-js' // يفضل استخدام نسخة السيرفر هنا

// إعداد عميل السوبابيس للسيرفر (باستخدام مفتاح الخدمة أو اليوزر)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // هذا سيقرأ القيمة 'sb_secret_...' من ملفك
)
//تعديل كمية الطلب
export async function update_quantity_rpc(Id, newQuantity) {
  // Supabase سيقوم بتحويل الـ String إلى UUID تلقائياً عند تمريره للدالة
  const { error } = await supabaseAdmin.rpc('update_order_quantity', {
    row_id: Id, 
    new_qty: newQuantity
  });

  if (error) {
    console.error("RPC Error:", error.message);
    return { error  };
  }

  return { success: true };
}



// في ملف الأكشن (Server Side)
export async function handleConfirmOrder(orderId: string,  newStat: string,itemsToUpdate?:any) {
  const { error } = await supabaseAdmin.rpc('update_order_final', {
  order_id_input: orderId,
  status_input: newStat,
  items_input:itemsToUpdate
 
});

  // يجب إضافة هذا السطر لكي تصل النتيجة للصفحة
  if (error) return { error: error.message };
  
  return { success: true };
  
}



//جالة جلب الطلبات
export async function getRecentOrders() {
  const { data, error } = await supabaseAdmin
    .from('orders') 
    .select(`
      id,
      status,
      order_id,
      created_at,
      product_id,
      quantity, 
      customer_name,
      customer_phone,
      customer_address,
      product:sys_data_node_77 ( Title, Image ) 
    `)
    .order('created_at', { ascending: false });


  return { data, error };
}

// في ملف adminActions.js




//دالة جلب الاحصائيات العامة
export async function Stats() {
  const { data, error } = await supabaseAdmin
    .from('sys_data_node_77')
    .select('id, Title, Image, views, orders, likes_count')
    .order('views', { ascending: false });

  if (data) {
    // هنا نقوم بإنشاء خاصية conversion يدوياً لكل منتج
    const dataWithConversion = data.map(item => ({
      ...item,
      conversion: item.views > 0 
        ? ((item.orders || 0) / item.views * 100).toFixed(1) 
        : "0.0"
    }));
    return { data: dataWithConversion, error };
  }

  return { data, error };
}
/////دالة جلب مشاهدة الاسبوع الاخير
export async function getWeeklyStats() {
  try {
    // 1. تحديد تاريخ البداية (قبل 7 أيام من الآن)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDate = sevenDaysAgo.toISOString();

    // 2. جلب المشاهدات من جدول product_views
    const { data, error } = await supabaseAdmin
      .from('product_views')
      .select('created_at')
      .gte('created_at', startDate)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 3. تجهيز قائمة بآخر 7 أيام (لضمان ظهور الأيام التي لا توجد بها مشاهدات كـ 0)
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      last7Days[dateKey] = 0;
    }

    // 4. ملء البيانات الحقيقية في القائمة
    data?.forEach((view: any) => {
      const dateKey = view.created_at.split('T')[0];
      if (last7Days[dateKey] !== undefined) {
        last7Days[dateKey]++;
      }
    });

    // 5. تحويلها لتنسيق يسهل على Recharts قراءته
    const chartData = Object.entries(last7Days).map(([date, count]) => ({
      // تنسيق التاريخ ليظهر "30/03" بدلاً من "2026-03-30"
      day: date.split('-').reverse().slice(0, 2).join('/'),
      views: count,
    }));

    return { data: chartData, error: null };
  } catch (error: any) {
    console.error("Error in getWeeklyStats:", error);
    return { data: [], error: error.message };
  }
}


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
//حذف السلة
export async function deleteOrder(orderId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('order_id', orderId);

    if (error) throw error;

    console.log(`تم حذف الطلب رقم ${orderId} بنجاح`);
    return { success: true, data };
  } catch (error) {
    console.error('خطأ أثناء الحذف:', error.message);
    return { success: false, error: error.message };
  }
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

//تحديث حالة المنتج

export async function updateProductStatus(id, nextStatus) {
  try {
    const { error } = await supabaseAdmin
      .from('sys_data_node_77')
      .update({ status: nextStatus })
      .eq('id', id);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "تم التحديث بنجاح" };

  } catch (err) {
    return { success: false, message: "خطأ في السيرفر" };
  }
}
