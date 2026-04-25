'use server' // هذا السطر يحول كل الدوال في الملف إلى Server Actions
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js' // يفضل استخدام نسخة السيرفر هنا
import { SUPABASE_STORAGE_URL } from "@/components/constants/index"; 
// إعداد عميل السوبابيس للسيرفر (باستخدام مفتاح الخدمة أو اليوزر)
async function adminAction(callback) {
  await requireAdmin()
  return callback()
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // هذا سيقرأ القيمة 'sb_secret_...' من ملفك
)
//تعديل كمية الطلب
// --- الجزء الأول ---

// دالة تحديث الكمية
export async function update_quantity_rpc(Id, newQuantity) {
  return adminAction(async () => {
    const { error } = await supabaseAdmin.rpc('update_order_quantity', {
      row_id: Id,
      new_qty: newQuantity
    });

    if (error) {
      console.error("RPC Error:", error.message);
      return { error };
    }

    return { success: true };
  });
}

// دالة تأكيد الطلب
export async function handleConfirmOrder(orderId, newStat, itemsToUpdate) {
  return adminAction(async () => {
    const { error } = await supabaseAdmin.rpc('update_order_full', {
      order_id_input: orderId,
      status_input: newStat,
      items_input: itemsToUpdate
    });

    if (error) return { error: error.message };

    return { success: true };
  });
}

// دالة جلب الطلبات الأخيرة
export async function getRecentOrders() {
  return adminAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id, status, order_id, created_at, product_id, quantity, selectedOptions,
        customer_name, customer_phone, customer_address,
        product:sys_data_node_77 (
          Title, Image, Price, quantity_all:quantity, extra_payload
        )
      `)
      .order('created_at', { ascending: false });

    if (error) return { data, error };

    const enrichedData = data.map((order) => {
      const product = order.product;
      let matchedPrice = product?.price ?? 0;
      let matchedStock = product?.quantity_all ?? 0;
      const selected = order.selectedOptions;
      const variants = product?.extra_payload;

      if (selected && typeof selected === "object" && Object.keys(selected).length > 0 && Array.isArray(variants)) {
        const match = variants.find((v) => {
          const options = v.options || {};
          return Object.keys(selected).every((key) => selected[key] === options[key]);
        });

        if (match) {
          matchedPrice = match.price;
          matchedStock = match.stock;
        }
      }

      return {
        ...order,
        product: {
          ...product,
          Price: matchedPrice,
          quantity_all: matchedStock,
          Image: product.Image ? `${SUPABASE_STORAGE_URL}${product.Image}` : null
        },
      };
    });

    return { data: enrichedData, error };
  });
}

// دالة جلب الإحصائيات العامة
export async function Stats() {
  return adminAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('sys_data_node_77')
      .select('id, Title, Image, views, orders, likes_count')
      .order('views', { ascending: false });

    if (error) return { data, error };

    const dataWithConversion = data.map(item => ({
      ...item,
      Image: item.Image ? `${SUPABASE_STORAGE_URL}${item.Image}` : null,
      conversion: item.views > 0 
        ? ((item.orders || 0) / item.views * 100).toFixed(1) 
        : "0.0"
    }));

    return { data: dataWithConversion, error };
  });
}

// دالة جلب مشاهدات الأسبوع الأخير
export async function getWeeklyStats() {
  return adminAction(async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startDate = sevenDaysAgo.toISOString();

      const { data, error } = await supabaseAdmin
        .from('product_views')
        .select('created_at')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const last7Days = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        last7Days[dateKey] = 0;
      }

      data?.forEach((view) => {
        const dateKey = view.created_at.split('T')[0];
        if (last7Days[dateKey] !== undefined) {
          last7Days[dateKey]++;
        }
      });

      const chartData = Object.entries(last7Days).map(([date, count]) => ({
        day: date.split('-').reverse().slice(0, 2).join('/'),
        views: count,
      }));

      return { data: chartData, error: null };
    } catch (error) {
      console.error("Error in getWeeklyStats:", error);
      return { data: [], error: error.message };
    }
  });
}

// دالة إضافة منتج
export async function addProductAction(payload) {
  return adminAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('sys_data_node_77')
      .insert([{
        "Title": payload.Title,
        "Price": payload.Price,
        "Image": payload.Image,
        category: payload.category,
        field_desc: payload.Description,
        extra_payload: payload.options,
        prev_price: payload.old_price,
        qty_level: payload.stock_quantity,
        status: 'active'
      }])
      .select();

    return { error: error?.message, data };
  });
}


// 2. تحديث منتج مع استبدال الصورة (حذف القديمة ووضع الجديدة)
// --- الجزء الثاني ---

// تحديث منتج
export async function updateProductAction(id, payload, oldImageName) {
  return adminAction(async () => {
    // 1. منطق الاستبدال: إذا كانت هناك صورة جديدة واسم مختلف عن القديمة
    if (payload.Image && oldImageName && payload.Image !== oldImageName) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('products')
        .remove([oldImageName]);

      if (storageError) {
        console.error("خطأ أثناء حذف الصورة القديمة:", storageError.message);
      }
    }

    // 2. التحديث في قاعدة البيانات
    const { data, error } = await supabaseAdmin
      .from('sys_data_node_77')
      .update({
        "Title": payload.Title,
        "Price": payload.Price,
        "Image": payload.Image,
        field_desc: payload.Description,
        extra_payload: payload.options,
      })
      .eq('id', id)
      .select();

    return { error: error?.message, data };
  });
}

// حذف منتج من السلة
export async function deleteId_order(id) {
  return adminAction(async () => {
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  });
}

// حذف منتج (بأفضل أداء: حذف مباشر بدون جلب)
export async function deleteProductAction(id, imageName) {
  return adminAction(async () => {
    // 1. حذف الصورة من التخزين
    if (imageName) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('products')
        .remove([imageName]);

      if (storageError) {
        console.error("خطأ أثناء حذف الصورة:", storageError.message);
      }
    }

    // 2. حذف المنتج من قاعدة البيانات
    const { error: deleteError } = await supabaseAdmin
      .from('sys_data_node_77')
      .delete()
      .eq('id', id);

    return { error: deleteError?.message };
  });
}

// حذف السلة
export async function deleteOrder(orderId) {
  return adminAction(async () => {
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
  });
}

// جلب جميع المنتجات للوحة التحكم
export async function getAllProductsForAdmin() {
  return adminAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('sys_data_node_77')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error("Admin Fetch Error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  });
}

// جلب جميع منتجات صنف معين باستثناء ID واحد (للأدمن)
export async function getFullCategoryProducts(categoryName, excludeId) {
  return adminAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('sys_data_node_77')
      .select('*')
      .eq('category', categoryName)
      .neq('id', excludeId)
      .order('id', { ascending: false });

    if (error) {
      console.error("Admin Full Category Fetch Error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  });
}

// جلب تفاصيل منتج واحد كاملة للأدمن
export async function getAdminProductById(id) {
  return adminAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('sys_data_node_77')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Admin Fetch ID Error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  });
}

// تحديث حالة المنتج
export async function updateProductStatus(id, nextStatus) {
  return adminAction(async () => {
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
  });
}

// رفع صورة
export async function uploadImageAction(formData) {
  return adminAction(async () => {
    const file = formData.get('image');
    const fileName = formData.get('path');

    const { data, error } = await supabaseAdmin.storage
      .from('products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  });
}

