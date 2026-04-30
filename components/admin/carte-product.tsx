'use client' 
import { useEffect, useState } from 'react'
import { formatProductImage } from "@/utils/productUtils"; 

import { Plus, Edit3, X, Heart, ShoppingBag, Star } from "lucide-react"
import FloatingMenu from '@/components/layout/FloatingMenu';
import { useRouter } from 'next/navigation';
import { updateProductStatus } from '@/app/actions/adminActions' 
import { ProductCard } from '@/components/store/ProductCard'
import { Addproducts } from '@/components/admin/add-products'
import { deleteProductAction, getAllProductsForAdmin } from '@/app/actions/adminActions'
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion' 
import { CategoryBar } from '@/components/store/CategoryBar'

export function ProductsPage() {
  const [isCropping, setIsCropping] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [products, setProducts] = useState([]) 
  const [loading, setLoading] = useState(true) 
  const router = useRouter();

  const startCropping = () => setIsCropping(true);
  const stopCropping = () => setIsCropping(false);

  const myActions = [
    { icon: '🏷️' ,label:'إضافة صنف',onClick: () => console.log('إضافة صنف') },
    { icon: '📦', label:'اضافة منتج', onClick: () => { setEditingProduct(null); setIsDrawerOpen(true); }},
  ];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null); 

  const hideDrawer = (data: any) => {
    setProducts((prev) => {
      if (!data?.id) return prev;
      const index = prev.findIndex(p => String(p.id) === String(data.id));
      if (index !== -1) {
        const updatedProducts = [...prev];
        updatedProducts[index] = { ...updatedProducts[index], ...data };
        return updatedProducts;
      } else {
        return [data, ...prev];
      }
    });
    setIsDrawerOpen(false);
  }

  const handleProductClick = (product: any) => {
    router.push(`/admin/products/${product.id}`);
  };

  const handleDelete = async (id, title, Image) => {
    const confirmDelete = window.confirm(`هل أنت متأكد من حذف منتج: ${title}؟`);
    if (confirmDelete) {
      try {
        const { error } = await deleteProductAction(id, Image);
        if (error) throw new Error(error);
        setProducts(products.filter(product => product.id !== id));
        toast.success("تم حذف المنتج بنجاح");
      } catch (error) {
        toast.error("فشل الحذف: " + error.message);
      }
    }
  };

  const handleUpdateStatus = async (id, nextStatus) => {
    const res = await updateProductStatus(id, nextStatus);
    if (res.success) {
      toast.success(res.message);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    } else {
      toast.error(res.message);
    }
  };

  const addNewProductLocally = (newProduct: any) => {
    setProducts(prev => [newProduct, ...prev])
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllProductsForAdmin();
      if (error) throw error;
      const productsWithUrls = data.map((product) => ({
        ...product,
        imageName: product.Image,
        Image: product.Image ? formatProductImage(product.Image) : null
      }));
      setProducts(productsWithUrls);
    } catch (error) {
      console.error('Error fetching Products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const categoriesList = products.length > 0 
    ? ["الكل", ...new Set(products.map(p => p.category).filter(Boolean))]
    : ["الكل"];

  const filteredProducts = selectedCategory === "الكل" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const existingCategories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[];

  useEffect(() => {
    fetchProducts()
  }, [])

  if (loading) return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2 bg-surface-2" dir="rtl">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden p-4 animate-pulse">
        <div className="h-48 bg-surface-2 mb-4 rounded-xl"></div>
        <div className="h-6 bg-surface-2 mb-2 rounded w-3/4"></div>
        <div className="h-4 bg-surface-2 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

return (
  <div className="bg-surface-2 min-h-screen pb-20" dir="rtl">
    <CategoryBar 
      categories={categoriesList} 
      selected={selectedCategory} 
      onSelect={(cat) => setSelectedCategory(cat)} 
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2">
      <AnimatePresence mode="popLayout">
        {filteredProducts.map((item, index) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key={item.id}
          >
            <ProductCard 
              product={item} 
              isAdmin={true} 
              priority={index < 3}
              handleDelete={handleDelete}
              setEditingProduct={setEditingProduct}
              setIsDrawerOpen={setIsDrawerOpen}
              handleArchive={handleUpdateStatus}
              handleProductClick={handleProductClick}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <FloatingMenu actions={myActions} />

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isCropping) setIsDrawerOpen(false); }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag={isCropping ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={isCropping ? 0 : 0.5}
              onDragEnd={(_, info) => {
                if (!isCropping && (info.offset.y > 100 || info.velocity.y > 400)) {
                  setIsDrawerOpen(false);
                }
              }}
              className="fixed bottom-0 inset-x-0 z-[70] bg-surface rounded-t-3xl max-h-[90dvh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-surface-2 rounded-full mx-auto my-4 flex-shrink-0" />

              {/* Content */}
              <div className={`flex-1 overflow-y-auto px-4 pb-10 overscroll-contain ${isCropping ? "overflow-hidden" : "custom-scrollbar"}`}>
                <Addproducts
                  initialData={editingProduct}
                  hideDrawer={hideDrawer}
                  categories={existingCategories}
                  onStartCrop={startCropping}
                  onStopCrop={stopCropping}
                  onProductAdded={(newProd) => {
                    addNewProductLocally(newProd);
                    setIsDrawerOpen(false);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}
