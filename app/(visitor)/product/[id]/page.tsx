"use client"
import React from 'react';
import { useEffect, useState } from 'react';
import { useProductStore } from '@/lib/store';
import { supabase } from '@/app/supabaseClient' 
import ProductDetailsView from '@/components/store/ProductDetailsView';
import ProductDetailsSkeleton from '@/components/store/ProductDetailsSkeleton';

export default function VisitorProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  const zustandProduct = useProductStore((state) => state.selectedProduct);
  const [product, setProduct] = useState(zustandProduct);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // نبدأ دائماً بحالة تحميل عند الرفرش

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let currentProduct = zustandProduct;

      // 1. إذا لم يكن المنتج في Zustand أو الـ ID مختلف، نجلبه من Supabase
      if (!zustandProduct || zustandProduct.id !== id) {
        const { data } = await supabase
          .from('Products') // تأكد أن حرف P كبير أو صغير حسب جدولك
          .select('*')
          .eq('id', id)
          .single();
        
        if (data) {
          setProduct(data);
          currentProduct = data;
        }
      }

      // 2. جلب الاقتراحات دائماً بناءً على المنتج (سواء من Zustand أو سوبابيس)
      if (currentProduct) {
        const { data: related } = await supabase
          .from('Products')
          .select('*')
          .eq('category', currentProduct.category)
          .neq('id', id)
          .limit(4);
        
        setSimilar(related || []);
      }
      setLoading(false);
    }

    fetchData();
  }, [id, zustandProduct]);

  // العرض الذكي: لا نظهر رسالة "غير متوفر" إلا إذا انتهى التحميل فعلاً والمنتج null
  if (loading && !product) return <ProductDetailsSkeleton />;
  
  if (!loading && !product) return <div className="min-h-screen bg-white" />; // صفحة بيضاء هادئة بدلاً من الرسالة

  return (
    <div className="min-h-screen bg-white" key={id}>
      <ProductDetailsView 
        product={product} 
        similarProducts={similar} 
        isAdmin={false} 
      />
      
      {/* زر الطلب الثابت */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t z-50">
        <button className="w-full bg-black text-white py-4 font-black tracking-[0.2em] uppercase active:scale-95 transition-transform shadow-2xl">
          أكد الطلب الآن 🛍️
        </button>
      </div>
    </div>
  );
}
