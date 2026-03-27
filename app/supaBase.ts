import { supabase } from '@/app/supabaseClient'

// دالة موحدة لمعالجة الردود
const handleResponse = (error: any, data?: any) => {
  if (error) {
    console.error("Admin Action Error:", error.message);
    return { success: false, message: error.message, code: error.code };
  }
  return { success: true, data };
};

// 1. زيادة المشاهدات
export async function incrementViewAction(productId: number) {
  
  const { error } = await supabase.rpc("increment_product_view_alll", {
    p_product_id: productId,
  });
  return {error};
}

// 2. إضافة منتج
export async function addProductAction(payload: any) {
  // استخدمنا المتغير 'supabase' المعرف في الأعلى مباشرة
  const { data, error } = await supabase
          .from('Products')
          .insert([payload])
          .select();
    

  return{error,data}
}

// 3. تحديث الحالة
// 3. تحديث منتج بالكامل (أو حقول معينة)
export async function updateProductAction(id: number, payload: any) {
  
  const { data, error } = await supabase
          .from('Products')
          .update(payload)
          .eq('id', id)
          .select();

  
  return {error, data};
}


// 4. حذف منتج
export async function deleteProductAction(id: string) {
  
  const { error } =  await supabase
             .from('Products')
             .delete()
             .eq('id', id);
  
  return {error};
}
export async function handle_Like(id:number,isLiked:boolean){
const { error } = await supabase
  .rpc('handle_like', { 
    row_id: Number(id), 
    increment_by: isLiked ? -1 : 1 
  });
    return {error}
  }