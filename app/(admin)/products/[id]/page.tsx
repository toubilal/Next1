'use client'


import ProductDetailsView from '@/components/ProductDetailsView';
// هنا سنجلب البيانات من Supabase باستخدام الـ ID
export default function AdminProductPage({ params }: { params: { id: string } }) {
  
  
  return (
    <div className="min-h-screen bg-white">
      <ProductDetailsView 
         product={product}
         isAdmin={true}
        
       />
      {/* زر الطلب يظهر فقط للزائر */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t z-50">
        <button className="w-full bg-black text-white py-4 font-black tracking-widest uppercase">
          أكد الطلب الآن 🛍️
        </button>
      </div>
    </div>
  );
}
