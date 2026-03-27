"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Image from "next/image";
import { supabase } from "@/app/supabaseClient";
import {incrementViewAction}  from '@/app/supaBase'

export default function ProductDetailsView() {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (typeof window === "undefined") return;

      const pathParts = window.location.pathname.split("/");
      const idStr = pathParts[pathParts.length - 1];
      const productId = idStr ? Number(idStr) : null;

      if (!productId || isNaN(productId)) {
        setLoading(false);
        return;
      }

      // ✅ تسجيل المشاهدة (الإضافة هنا فقط)
      
      // الحصول على تاريخ اليوم (مثلاً: 2026-03-25)
const today = new Date().toISOString().split('T')[0];

// إنشاء "قفل" فريد لهذا المنتج بالذات
const storageKey = `view_log_${productId}`; 

// قراءة حالة القفل: هل فُتح اليوم؟
const lastViewDate = localStorage.getItem(storageKey);

if (lastViewDate !== today) {
    // إذا وصلنا هنا، فهذا يعني أن هذا الـ ID لم يُسجل لهذا اليوم (today)
    const { error } = await incrementViewAction(productId);

    if (!error) {
        // نحدث القفل ونربطه بتاريخ اليوم
        localStorage.setItem(storageKey, today);
    }
}

      
      
   /*   await supabase.rpc("increment_product_view_alll", {
        p_product_id: productId,
      });*/

      // جلب المنتج
      const { data: mainProduct } = await supabase
        .from("Products")
        .select("*")
        .eq("id", productId)
        .single();

      if (mainProduct) {
        setProduct(mainProduct);

        const { data: similar } = await supabase
          .from("Products")
          .select("*")
          .eq("category", mainProduct.category)
          .neq("id", productId)
          .limit(4);

        if (similar) setRelated(similar);
      }

      setLoading(false);
    };

    fetchProduct();
  }, []);

  // 1. حالة التحميل (بدلاً من أي رسائل نصية)
  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white pb-32 space-y-4">
        <div className="w-full aspect-square bg-slate-100 animate-pulse rounded-2x2" />
        <div className="h-8 bg-slate-100 animate-pulse w-3/4 rounded-lg" />
        <div className="h-20 bg-slate-100 animate-pulse w-full rounded-lg" />
      </div>
    );
  }

  // 2. إذا لم يجد منتج (صفحة فارغة هادئة بدلاً من الرسالة القديمة)
  if (!product) {
    return <div className="min-h-screen bg-white" />; 
  }

  return (
    <div className="max-w-md mx-auto bg-white pb-32 animate-in fade-in duration-500">
      <div className={`relative w-full aspect-square bg-slate-50 ${!isLoaded ? "animate-pulse" : ""}`}>
        <Image
          src={product.Image || "/placeholder.jpg"}
          fill
          alt={product.Title}
          onLoadingComplete={() => setIsLoaded(true)}
          className={`object-cover transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          unoptimized
        />
      </div>

      <div className="p-6 space-y-6 text-right" dir="rtl">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-black uppercase text-slate-900 leading-none">{product.Title}</h1>
          <p className="text-xl font-bold text-blue-600">{product.Price} DA</p>
        </div>

        <div className="bg-slate-50 p-4 border-r-4 border-black font-medium text-slate-700">
          {product.Description || "لا يوجد وصف متوفر."}
        </div>

        {related.length > 0 && (
          <div className="pt-10 space-y-4">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] border-b border-black inline-block pb-1">قد يعجبك أيضاً</h3>
            <div className="grid grid-cols-2 gap-4">
              {related.map((item) => (
                <div key={item.id}  className="cursor-pointer group">
                  <Link href={`/product/${item.id}`}>
                  <div className="relative aspect-[3/4] bg-slate-100 mb-2 overflow-hidden border border-slate-50">
                    <Image src={item.Image || "/placeholder.jpg"} fill alt={item.Title} className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                  </div>
                  <h4 className="text-[10px] font-bold uppercase truncate">{item.Title}</h4>
                  <p className="text-xs font-black text-blue-600">{item.Price} DA</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* زر الطلب الثابت */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 backdrop-blur-md z-50">
        <button className="w-full bg-black text-white py-4 font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-transform">
          أكد الطلب الآن 🛍️
        </button>
      </div>
    </div>
  );
}
