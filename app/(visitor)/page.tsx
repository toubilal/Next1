"use client";
import { ProductCard } from '@/components/store/ProductCard';
import { useEffect, useState } from 'react'
import {handle_Like} from '@/app/supaBase'
import { motion, AnimatePresence } from 'framer-motion' 
import { supabase } from '@/app/supabaseClient' 
import {CategoryBar} from'@/components/store/CategoryBar'
import { useProductStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { SUPABASE_STORAGE_URL } from "@/components/constants/index"; 

export default function VisitorPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  


  
  
  
  
const router = useRouter();
const handleProductClick = (product: any) => {
router.push(`/product/${product.id}`);};
  
  const fetchProducts = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_public_products');
    if (error) throw error;

    // معالجة البيانات وإضافة الرابط الكامل للصور
    const processedData = data.map((product) => ({
      ...product,
      // إذا كان هناك اسم صورة، ندمجه مع الرابط الأساسي، وإلا نضع صورة افتراضية
      Image: product.Image 
        ? `${SUPABASE_STORAGE_URL}${product.Image}` 
        : "/placeholder.png" // تأكد من وجود هذه الصورة في مجلد public
    }));

    setProducts(processedData);
  } catch (error) {
    console.error('Error fetching products:', error.message);
  } finally {
    setLoading(false);
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
    const { error } = await handle_Like(id,isLiked);
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
  if (loading) return (
  <main className="p-4 bg-surface-2 min-h-screen">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col w-full bg-surface border border-border overflow-hidden shadow-sm">
          
          {/* Header */}
          <div className="flex items-center p-3">
            <div className="w-8 h-8 rounded-full bg-surface-2"></div>
            <div className="mr-3 h-3 bg-surface-2 rounded w-20"></div>
          </div>

          {/* Image */}
          <div className="w-full aspect-square bg-surface-2"></div>

          {/* Actions */}
          <div className="flex gap-4 p-3 border-t border-border">
            <div className="w-5 h-5 bg-surface-2 rounded-full"></div>
            <div className="w-5 h-5 bg-surface-2 rounded-full"></div>
          </div>

          {/* Info */}
          <div className="p-3 space-y-3">
            <div className="h-4 bg-surface-2 rounded w-3/4"></div>
            <div className="h-3 bg-surface-2 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  </main>
);

return (
  <main className="p-4 bg-surface-2 min-h-screen">
    
    <CategoryBar 
      categories={categoriesList} 
      selected={selectedCategory} 
      onSelect={(cat) => setSelectedCategory(cat)} 
    />

    <div
      id="products-part"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2 bg-surface-2"
    >
      <AnimatePresence mode="popLayout">
        {filteredProducts.map((item, index) => (
          <ProductCard 
            key={item.id} 
            product={item} 
            isAdmin={false}
            priority={index < 3}
            isLiked={userLikedIds.includes(item.id)}
            likedProduct={toggleLike}
            handleProductClick={handleProductClick}
          />
        ))}
      </AnimatePresence>
    </div>
  </main>
);
}
