"use client";

import { Hh } from "@/components/admin/Createfolder"

import {ProductsPage} from'@/components/admin/carte-product'



export default function Home() {
  // تعريف المتغيرات لتخزين ما يكتبه المستخدم
  
  

  return (
  /* غيرنا bg-gray-800 إلى bg-slate-50 أو bg-background */
  <div className="min-h-screen bg-surface-2  p-4 md:p-8 transition-colors duration-500">
     
    {/* لمسة احترافية: وضع محتوى الصفحة داخل حاوية محددة العرض */}
    <div className="max-w-7xl mx-auto">
      
      {/* نموذج الإضافة */}
     

      <hr className="my-12 border-slate-200" />
      
      {/* شبكة المنتجات */}
      <ProductsPage />
      
      
    </div>
  </div>
);

}