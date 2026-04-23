'use client'

import React, { useState, useEffect } from "react"
import {MoreInfo} from '@/components/admin/more-informations'
import { motion,AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import {addProductAction,updateProductAction} from'@/app/actions/adminActions'
import { Loader2, Plus, Image as ImageIcon, X, Edit3 } from "lucide-react"

import { supabase } from '@/app/supabaseClient'
import { uploadImageAction } from '@/app/actions'
import { getCroppedImg } from '@/utils/cropImage'

interface AddProductsProps {
  initialData?: any;
  onProductAdded?: (product: any) => void;
  onProductUpdate?: (id: string, updatedData: any) => void;
  categories: string[];
  hideDrawer?:(newProduct:any)=>void// أضف هذا السطر
}

export function Addproducts({ initialData, onProductAdded, onProductUpdate, categories,hideDrawer,onStartCrop,
  onStopCrop }: AddProductsProps){
  useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [productDescription, setProductDescription] = useState("");
const [productQuantity, setProductQuantity] = useState("");
const [productDetails, setProductDetails] = useState("");
const [allCategories, setAllCategories] = useState<string[]>([]);
const [variants, setVariants] = useState([]);
const [suggestions, setSuggestions] = useState<string[]>([]);
const setextra_payload = (payload: any) => {
  // نقوم بتحويل المصفوفة القادمة من المكون إلى الشكل المطلوب لـ Supabase
  const formattedVariants = payload.variants.map((v: any) => ({
    options: {
      color: v.color,
      storage: v.storage,
    },
    price: Number(v.price),
    stock: Number(v.stock),
  }));

  // الآن نحفظ النسخة المنسقة في الـ state
  setVariants(formattedVariants);
};

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setproductCategory(value);

    if (value.length > 0) {
      // الفلترة تتم الآن على القائمة القادمة من الأب مباشرة
      const filtered = categories.filter(cat => 
        cat.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }}
  const isEditMode = !!initialData;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null); // الملف قبل القص

  const [file, setfile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const [productName, setProductName] = useState("");
  const [productCategory, setproductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.Title || "");
      setProductPrice(initialData.Price?.toString() || "");
      setproductCategory(initialData.category || "");
    } else {
      setProductName("");
      setProductPrice("");
      setproductCategory("");
    }
  }, [initialData]);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const selectedFile = e.target.files[0];
    setTempFile(selectedFile); // نخزنه مؤقتاً هنا
    
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
      setIsCropping(true);
      onStartCrop?.();
    });
    reader.readAsDataURL(selectedFile);
  }
};

const handleCropSave = async () => {
  try {
    const croppedBlob = await getCroppedImg(imageSrc!, croppedAreaPixels);
    if (croppedBlob) {
      const croppedFile = new File([croppedBlob], tempFile?.name || "product.jpg", { type: "image/jpeg" });
      setfile(croppedFile); // الآن فقط اعتمدنا الملف
      setIsCropping(false);
      onStopCrop?.();
      toast.success("تم اعتماد الصورة");
    }
  } catch (e) {
    toast.error("خطأ في القص");
  }
};

  

  const handleAction = async () => {
    if (
  !productName ||
  ((!isMoreOpen && variants) && !productPrice) ||
  !productCategory ||
  (!isEditMode && !file)
) {
  return toast.error("يرجى إكمال البيانات");
}

    setIsUploading(true);

    try {
      let finalImagePath = initialData?.Image || "";

      if (file) {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const pathForDb = `/uploads/${fileName}`;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('path', pathForDb);
        const uploadResult = await uploadImageAction(formData);
        if (!uploadResult.success) throw new Error("فشل رفع الصورة");
        finalImagePath = pathForDb;
      }

      const productPayload = {
        Title: productName,
        Price: Number.parseFloat(productPrice) || 0,
        Image: finalImagePath,
        category: productCategory,
        options:variants,
        views:0 ,
        orders:0,
        status:'active'
      };

      if (isEditMode) {
        const { data, error } = await updateProductAction(initialData.id,productPayload);

        if (error) {throw error;
      } else{ toast.success("تم تحديث المنتج بنجاح! ✏️");
       hideDrawer(data[0]);}
           } else {
        const { data, error } = await addProductAction(productPayload);

        if (error) throw error;
        toast.success("تمت الإضافة بنجاح! 🎉");
        if (onProductAdded) onProductAdded(data[0]);
      }

      if (!isEditMode) {
        setProductName("");
        setProductPrice("");
        setproductCategory("");
        setfile(null);
        setFileInputKey(Date.now());
      }
    } catch (err: any) {
      toast.error("حدث خطأ: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
   <motion.div 
  className="max-w-5xl mx-auto p-0 md:p-0 space-y-6 mb-5" dir="rtl"
>
  <Toaster />
 
  
  
  {/* العنوان الآن داخل حاوية بـ padding */}
  <div className="p-6 pb-2">
    <h2 className="text-xl font-bold text-center text-black">
      {isEditMode ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}
    </h2>
  </div>

  {/* الحاوية الداخلية أصبحت هي التي تحمل الـ padding لتأخذ المساحة والتحكم */}
 
      <div className="space-y-4 space-y-2">
        <label className="text-sm font-medium">صورة المنتج:</label>
        <input 
          type="file" 
          onChange={onFileChange} 
          key={fileInputKey}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />

        {isCropping && (
  <div className="fixed inset-0 z-[100] bg-black flex flex-col">

    {/* 🖼️ منطقة القص */}
    <div className="flex-1 relative bg-[#1a1a1a]">
      <Cropper
        image={imageSrc!}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={setCrop}
        onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
        onZoomChange={setZoom}
      />
    </div>

    {/* 🎛️ controls */}
    <div className="bg-white p-6 rounded-t-3xl space-y-4">

      <input 
        type="range" 
        value={zoom} 
        min={1} 
        max={3} 
        step={0.1} 
        onChange={(e) => setZoom(Number(e.target.value))} 
        className="w-full"
      />

      <div className="flex gap-3">
        <button 
          onClick={() => {
            setIsCropping(false);
            onStopCrop?.();
            setTempFile(null);
            setFileInputKey(Date.now());
          }} 
          className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl"
        >
          إلغاء
        </button>

        <button 
          onClick={handleCropSave} 
          className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg"
        >
          اعتماد الصورة
        </button>
      </div>

    </div>
  </div>
)}
      </div>
       <div
  
   className="flex-1 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-0"
>
 <div className="  p-6 pt-2 space-y-4 ">
      <input 
        placeholder="اسم المنتج" 
        className="w-full p-3 border border-slate-300 rounded-xl bg-white text-black placeholder:text-slate-400 focus:border-primary outline-none transition-all shadow-sm"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />

      

      <input 
    placeholder="الصنف" 
    className="w-full p-3 border border-slate-300 rounded-xl bg-white text-black outline-none transition-all shadow-sm focus:border-primary"
    value={productCategory}
    onChange={handleCategoryChange}
    onFocus={() => productCategory && setShowSuggestions(true)}
    // لإخفاء القائمة عند النقر خارجاً (مع تأخير بسيط ليسمح بالضغط على الاقتراح)
    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
  />
  
  {/* خانة الوصف */}
<textarea 
  placeholder="وصف المنتج" 
  className="w-full p-3 border border-slate-300 rounded-xl bg-white text-black outline-none transition-all shadow-sm focus:border-primary h-24 resize-none"
  value={productDescription}
  onChange={(e) => setProductDescription(e.target.value)}
/>

<>
  {/* السعر + الكمية (ثابتين 100%) */}
  <motion.div layout className="space-y-4">
    <input 
      placeholder="السعر" 
      type="number"
      disabled={isMoreOpen}
      className={`w-full p-3 border rounded-xl outline-none shadow-sm transition
        ${isMoreOpen 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
          : 'bg-white text-black border-slate-300'
        }`}
      value={productPrice}
      onChange={(e) => setProductPrice(e.target.value)}
    />

    <input 
      placeholder="الكمية المتاحة" 
      type="number"
      disabled={isMoreOpen}
      className={`w-full p-3 border rounded-xl outline-none shadow-sm transition
        ${isMoreOpen 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
          : 'bg-white text-black border-slate-300'
        }`}
      value={productQuantity}
      onChange={(e) => setProductQuantity(e.target.value)}
    />
  </motion.div>

  {/* الزر */}
  <div className="flex flex-col gap-2 mt-2">
    <button 
      onClick={() => setIsMoreOpen(!isMoreOpen)}
      className="flex items-center justify-between px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-800"
    >
      <span>تفاصيل إضافية</span>
      <span className={`transition-transform duration-300 ${isMoreOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
  </div>

  {/* فقط هذا داخل AnimatePresence */}
  <AnimatePresence mode="wait">
    {isMoreOpen && (
      <motion.div
        key="moreinfo"
        layout
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-xs text-gray-500 mb-2">
          مثال: اللون، الحجم، الماركة، أو أي معلومات إضافية
        </p>
        <MoreInfo
  initialData={{ variants }}
  setextra_payload={setextra_payload}
/>
      </motion.div>
    )}
  </AnimatePresence>
</>


{/* خانة التفاصيل (JSONB) */}


  
      {showSuggestions && suggestions.length > 0 && (
    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 ">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="p-3 hover:bg-slate-50 cursor-pointer text-black text-sm border-b last:border-none border-slate-100"
          onClick={() => {
            setproductCategory(suggestion);
            setShowSuggestions(false);
          }}
        >
          {suggestion}
        </div>
      ))}
    </div>
  )}
  </div>
  </div>
 <div className="mt-auto pt-2">
      <button 
  onClick={handleAction}
  disabled={isUploading}
  // أضفنا flex و items-center و justify-center للتحكم الكامل في التمركز
  className={`w-full flex items-center justify-center text-black p-4 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all shadow-lg ${
    isUploading ? 'bg-slate-200 cursor-not-allowed' : 'bg-primary hover:bg-[#b8952e] active:scale-95'
  }`}
>
  {isUploading ? (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="animate-spin h-4 w-4" /> جاري الحفظ...
    </span>
  ) : isEditMode ? "تحديث المنتج" : "حفظ في السيرفر"}
</button>

      </div>
      
    </motion.div>
  );
}
