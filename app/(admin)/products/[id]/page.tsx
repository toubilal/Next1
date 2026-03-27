"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Image from "next/image";
import { supabase } from "@/app/supabaseClient";
import { motion, AnimatePresence } from 'framer-motion';
import {Addproducts} from '@/components/admin/add-products'

// ملاحظة: تأكد من استيراد المكون Addproducts من مساره الصحيح
// import Addproducts from "./Addproducts"; 

export default function ProductDetailsView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  
const hideDrawer = (newProduct:[]) => {
  setIsDrawerOpen(false);
  setProduct(newProduct)
}


  useEffect(() => {
    const fetchData = async () => {
      // 1. استخراج الـ ID من الرابط
      if (typeof window === "undefined") return;
      const pathParts = window.location.pathname.split("/");
      const idStr = pathParts[pathParts.length - 1];
      const productId = idStr ? Number(idStr) : null;

      if (!productId || isNaN(productId)) {
        setLoading(false);
        return;
      }

      // 2. جلب المنتج
      const { data: mainProduct } = await supabase
        .from("Products")
        .select("*")
        .eq("id", productId)
        .single();

      if (mainProduct) {
        setProduct(mainProduct);
        // جلب المنتجات ذات الصلة
        const { data: similar } = await supabase
          .from("Products")
          .select("*")
          .eq("category", mainProduct.category)
          .neq("id", productId)
          .limit(4);
        if (similar) setRelated(similar);
      }

      // 3. جلب التصنيفات لـ Drawer التعديل
      const { data: cats } = await supabase.from('Products').select('category');
      if (cats) {
        const unique = Array.from(new Set(cats.map(c => c.category))) as string[];
        setExistingCategories(unique);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-white pb-32 space-y-4">
        <div className="w-full aspect-square bg-slate-100 animate-pulse rounded-2xl" />
        <div className="h-8 bg-slate-100 animate-pulse w-3/4 rounded-lg" />
        <div className="h-20 bg-slate-100 animate-pulse w-full rounded-lg" />
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-white" />;

  return (
    <div className="max-w-md mx-auto bg-white pb-32 animate-in fade-in duration-500">
      {/* منطقة الصورة */}
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

      {/* تفاصيل المنتج */}
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
                <div key={item.id} 
                className="cursor-pointer group">
                 <Link href={`/products/${item.id}`}>
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

      {/* زر Edit الثابت */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white/80 backdrop-blur-md z-50">
        <button 
          onClick={() => setIsDrawerOpen(true)
            
            
          }
          className="w-full bg-black text-white py-4 font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-transform"
        >
          Edit Product
        </button>
      </div>

      {/* الـ Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150 || info.velocity.y > 500) {
                  setIsDrawerOpen(false);
                }
              }}
              className="fixed bottom-0 inset-x-0 z-[70] bg-white rounded-t-[32px] p-6 max-h-[90vh] overflow-y-auto max-w-md mx-auto"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

              {/* نمرر بيانات المنتج الحالي للنموذج ليتم تعديله */}
               <Addproducts 
                initialData={product} 
                categories={existingCategories} 
                hideDrawer={hideDrawer}
              /> 
             
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
