// في ملف @/app/supabaseClient (Client Side)
import { supabase } from '@/app/supabaseClient'
// زيادة المشاهدة
export async function incrementViewAction(productId: number) {
  const { error } = await supabase.rpc("increment_product_view_alll", {
    p_product_id: productId,
  });
  return { error };
}

// معالجة اللايك
export async function handle_Like(id: number, isLiked: boolean) {
  const { error } = await supabase.rpc('handle_like', { 
    row_id: id, 
    increment_by: isLiked ? -1 : 1 
  });
  return { error };
}
