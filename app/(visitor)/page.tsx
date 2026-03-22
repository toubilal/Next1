"use client";
import { ProductCard } from '@/components/store/ProductCard';
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion' 
import { supabase } from '@/app/supabaseClient' 
import {CategoryBar} from'@/components/store/CategoryBar'
export default function VisitorPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('Products').select('*').eq('status', 'active')
      if (error) throw error;
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error.message)
    } finally {
      setLoading(false)
    }
    
  }
  const [selectedCategory, setSelectedCategory] = useState("الكل");

// 2. استخراج الأصناف من المنتجات التي جلبتها من Supabase
const categoriesList = products.length > 0 
  ? ["الكل", ...new Set(products.map(p => p.category).filter(Boolean))]
  : ["الكل"];

// 3. تصفية المنتجات التي ستعرض في الـ map
const filteredProducts = selectedCategory === "الكل" 
  ? products 
  : products.filter(p => p.category === selectedCategory);

const existingCategories = Array.from(
  new Set(products.map((p) => p.category).filter(Boolean))
) as string[];
  
  
  const toggleLike = async (id, isLiked) => {
  // حساب العدد الجديد بناءً على الحالة الحالية
  

  try {
    // 1. تحديث Supabase
    const { error } = await supabase
  .rpc('handle_like', { 
    row_id: Number(id), 
    increment_by: isLiked ? -1 : 1 
  });


    if (error) throw error;

    // 2. تحديث الواجهة (Optimistic Update)
    

    // 3. حفظ الحالة في الهاتف (LocalStorage)
    const likedProducts = JSON.parse(localStorage.getItem('liked_products') || '[]');
    if (isLiked) {
      // إزالة من المفضلة
      const filtered = likedProducts.filter(pid => pid !== id);
      localStorage.setItem('liked_products', JSON.stringify(filtered));
    } else {
      // إضافة للمفضلة
      likedProducts.push(id);
      localStorage.setItem('liked_products', JSON.stringify(likedProducts));
    }

  } catch (err) {
    console.error("فشل تحديث الإعجاب:", err.message);
  }
};
const [userLikedIds, setUserLikedIds] = useState([]);

useEffect(() => {
  const saved = JSON.parse(localStorage.getItem('liked_products') || '[]');
  setUserLikedIds(saved);
}, []);
  
  
  useEffect(() => {
    fetchProducts()
  }, [])
  
  
   if (loading)    return   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2 bg-slate-50">
  {Array.from({ length: 4 }).map((_, i) => (
    <div
      key={i}
      className="relative flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden p-4 animate-pulse"
    >
      {/* الصورة */}
      <div className="h-48 bg-gray-300 mb-4 rounded-xl"></div>

      {/* العنوان */}
      <div className="h-6 bg-gray-300 mb-2 rounded w-3/4"></div>

      {/* السعر */}
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  ))}
</div>
  
  
  return (
    <main className="p-4 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-right mb-6">متجرنا 🛍️</h1>
 <CategoryBar 
      categories={categoriesList} 
      selected={selectedCategory} 
      onSelect={(cat) => setSelectedCategory(cat)} 
      
    />
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2 bg-slate-50">
      <AnimatePresence mode="popLayout">
           {filteredProducts.map((item) => (
          <ProductCard 
            key={item.id} 
            product={item} 
            isAdmin={false}
            isLiked={userLikedIds.includes(item.id)}
  likedProduct ={toggleLike}
            
            // هنا السحر! الأزرار ستختفي تلقائياً
          />
        ))}
         </AnimatePresence>
      </div>
    </main>
  );
}
