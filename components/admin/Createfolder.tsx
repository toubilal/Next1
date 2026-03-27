'use client'
import { useState, useEffect } from 'react' // أضفنا useEffect
import { createFolder1,uploadImageAction, getProducts } from '@/app/actions'

import toast, { Toaster } from 'react-hot-toast'

export function Hh() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // حالة جديدة لحفظ رابط الصورة

  const handleUpload = async () => {
    if (!file) return toast.error("اختر صورة أولاً");

    const formData = new FormData();
    formData.append('image', file);

    // استدعاء الدالة الجديدة التي استبدلناها في السيرفر
    const result = await uploadImageAction(formData); 
    
    if (result.success && result.url) {
      setImageUrl(result.url); // تحديث الواجهة بالصورة الجديدة
      toast.success("تم رفع الصورة وعرضها!");
    } else {
      toast.error("فشل الرفع");
    };
}

  
  
  ///////////////
  
  ////////////////
  const [productName, setProductName] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [products, setProducts] = useState([]) // لتخزين المنتجات المجلوبة

  // جلب البيانات فور فتح الصفحة
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  const handleCreate = async () => {
    const result = await createFolder1(productName, productPrice);
    if (result.success) {
      toast.success(result.message);
      setProductName('');
      setProductPrice('');
      loadData(); // تحديث القائمة فوراً بعد الحفظ
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-black p-8 gap-6">
    
    <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        className="text-white"
      />

      <button onClick={handleUpload} className="bg-blue-600 p-2 rounded">
        رفع الصورة
      </button>

      {/* عرض الصورة فور نجاح الرفع */}
      {imageUrl && (
        <div className="mt-4">
          <p>صورة المنتج:</p>
          <img src={imageUrl} alt="Uploaded" className="w-40 h-40 object-cover rounded-lg" />
        </div>
      )}
    
    
      
      
      {/* خانات الإدخال والزر */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <input 
          type="text" placeholder="اسم المنتج" value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="p-3 rounded-xl bg-zinc-900 text-white border border-zinc-700 outline-none"
        />
        <input 
          type="number" placeholder="السعر" value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          className="p-3 rounded-xl bg-zinc-900 text-white border border-zinc-700 outline-none"
        />
        <button onClick={handleCreate} className="bg-blue-600 text-white py-3 rounded-2xl font-bold active:scale-95 transition-all">
          حفظ المنتج
        </button>
      </div>

      {/* قائمة عرض المنتجات */}
      <div className="w-full max-w-xs mt-6">
        <h3 className="text-zinc-500 mb-4 border-b border-zinc-800 pb-2">المنتجات المحفوظة:</h3>
        <div className="flex flex-col gap-2">
          {products.map((item: any) => (
            <div key={item.id} className="bg-zinc-900 p-4 rounded-xl flex justify-between items-center border border-zinc-800">
              <span className="text-white font-medium">{item.name}</span>
              <span className="text-green-500 font-bold">{item.price} د.ج</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
