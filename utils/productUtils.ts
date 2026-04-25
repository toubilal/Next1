// utils/productUtils.ts
import { SUPABASE_STORAGE_URL } from "@/components/constants/index";

export const formatProductImage = (product: any) => {
  // نقوم بإضافة الرابط الكامل فقط إذا لم يكن موجوداً
  return {
    ...product,
    Image: product.Image && !product.Image.startsWith('http') 
      ? `${SUPABASE_STORAGE_URL}${product.Image}` 
      : product.Image
  };
};
