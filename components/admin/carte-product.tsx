'use client' 
import { useEffect, useState } from 'react'
import { Plus,Edit3 ,X,Heart, ShoppingBag, Star } from "lucide-react"
import FloatingMenu from '@/components/layout/FloatingMenu';
import {deleteImageFile} from '@/app/actions.ts'
import { useRouter } from 'next/navigation';
import { updateProductStatus } from '@/app/actions/adminActions' 
import {ProductCard} from '@/components/store/ProductCard'
import {Addproducts} from '@/components/admin/add-products'
import {deleteProductAction,getAllProductsForAdmin} from '@/app/actions/adminActions'
import toast,{ Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion' 
import Image from 'next/image'
import {CategoryBar} from'@/components/store/CategoryBar'
export  function ProductsPage() {
  const [isCropping, setIsCropping] = useState(false);

const startCropping = () => setIsCropping(true);
const stopCropping = () => setIsCropping(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [products, setProducts] = useState([]) // مخزن للمنتجات
  const [loading, setLoading] = useState(true) // حالة التحميل
const myActions = [
    { icon: '🏷️' ,label:'إضافة صنف',onClick: () => console.log('إضافة منتج') },
    { icon: '📦', label:'اضافة منتج',onClick: () => {setEditingProduct(null); setIsDrawerOpen(true); 
    }},
  ];
const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [editingProduct, setEditingProduct] = useState<any>(null); 

const hideDrawer=(data:any)=>{setProducts((prev) => {
  if (!data?.id) return prev;

  const index = prev.findIndex(p => String(p.id) === String(data.id));

  if (index !== -1) {
    // حالة التحديث: دمج البيانات
    const updatedProducts = [...prev];
    
    // نأخذ المنتج القديم كما هو، ونضع فوقه التعديلات الجديدة فقط
    // هكذا نضمن أن العناصر التي لم نرسلها (مثل category) لا تضيع
    updatedProducts[index] = { ...updatedProducts[index], ...data };
    
    return updatedProducts;
  } else {
    // حالة الإضافة: كما هي
    return [data, ...prev];
  }
});

setIsDrawerOpen(false);

}


const router = useRouter();
const handleProductClick = (product: any) => {
router.push(`/products/${product.id}`);};
// دالة الحذف
const handleDelete = async (id, title,Image) => {
  // نافذة التأكيد
  const confirmDelete = window.confirm(`هل أنت متأكد من حذف منتج: ${title}؟`);
  
  if (confirmDelete) {
    try {
      const { error } = await deleteProductAction(id);// الحذف بناءً على المعرف الفريد للمنتج
  if (error) {throw error;} else{
  await deleteImageFile(Image)
  

      // تحديث الشاشة فوراً بفلترة المصفوفة وحذف المنتج منها
      setProducts(products.filter(product => product.id !== id));
      toast.success("تم حذف المنتج بنجاح");}
      
    } catch (error) {
      toast.error("فشل الحذف: " + error.message);
    }
  }
};

const handleUpdateStatus = async (id, nextStatus) => {
  const res = await updateProductStatus(id, nextStatus);

  if (res.success) {
    alert(res.message);
    // تحديث الواجهة
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: nextStatus } : p
      )
    );

    console.log(res.message); // أو toast
  } else {
    alert(res.message);
  }
};

const addNewProductLocally = (newProduct) => {
  setProducts((prevProducts) => [newProduct, ...prevProducts]);
};

  // دالة جلب البيانات من Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await getAllProductsForAdmin();

     
      
      if (error) throw error
      setProducts(data)
    } catch (error) {
      console.error('Error fetching Products:', error.message)
    } finally {
      setLoading(false)
    }
  }
// 1. حالة الصنف المختار (الافتراضي: الكل)
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





  // تشغيل الدالة بمجرد فتح الصفحة
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
  <>
  {/*<Addproducts onProductAdded={addNewProductLocally} />*/}  
    <CategoryBar 
      categories={categoriesList} 
      selected={selectedCategory} 
      onSelect={(cat) => setSelectedCategory(cat)} 
    />

    {/* الحاوية الكبرى */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2 bg-slate-50">
      <AnimatePresence mode="popLayout">
        {filteredProducts.map((item,index) => {
  const isActive = selectedId === item.id;

  return (<ProductCard 
  product={item} 
  key={item.id}
  isAdmin={true} 
  priority={index < 3}
  isActive={selectedId === item.id}
  setSelectedId={setSelectedId}
  handleDelete={handleDelete}
  setEditingProduct={setEditingProduct}
  setIsDrawerOpen={setIsDrawerOpen}
  handleArchive={handleUpdateStatus}
  handleProductClick={handleProductClick}
  
/>

    
          );
        })}
      </AnimatePresence>
      {/* زر الإضافة العائم في أسفل الشاشة */}
 <FloatingMenu actions={myActions} />

<AnimatePresence>
  {isDrawerOpen && (
  <>
    {/* الخلفية */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (!isCropping) setIsDrawerOpen(false);
      }}
      className="fixed inset-0 z-50 bg-black/40"
    />

    {/* Drawer */}
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}

      /* 🔥 تعطيل السحب أثناء القص */
      drag={isCropping ? false : "y"}

      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={isCropping ? 0 : 0.5}

      onDragEnd={(_, info) => {
        if (isCropping) return;

        if (info.offset.y > 100 || info.velocity.y > 400) {
          setIsDrawerOpen(false);
        }
      }}

      className="fixed bottom-0 inset-x-0 z-[70] bg-white rounded-t-3xl max-h-[85dvh] flex flex-col overflow-hidden"
    >
      {/* handle */}
      <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4 flex-shrink-0" />

      {/* content */}
     <div className={`flex-1 overflow-y-auto px-4 pb-6 overscroll-contain ${isCropping ? "overflow-hidden" : ""}`}>
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
  </>
);


  

}
