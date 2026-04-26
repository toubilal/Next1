'use client'

import React, { useState, useEffect } from "react"
import { formatProductImage } from "@/utils/productUtils"; 
 
import {MoreInfo} from '@/components/admin/more-informations'
import imageCompression from 'browser-image-compression';

import { motion,AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import {addProductAction,uploadImageAction,updateProductAction} from'@/app/actions/adminActions'
import { Loader2, Plus, Image as ImageIcon, X,Trash2, Edit3 } from "lucide-react"
import Image from 'next/image'
import { supabase } from '@/app/supabaseClient'
//import { uploadImageAction } from '@/app/actions'
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
    const {
      Title = "",
      category = "",
      extra_payload = [],
      field_desc = "",
      Price = "",
      Image = "" // استخراج اسم الصورة
    } = initialData;

    // 2. تحديث الحالات البسيطة
    setProductName(Title);
    setproductCategory(category);
    setProductDescription(field_desc);
    setVariants(extra_payload);

    // 3. التحقق من وجود متغيرات (Variants) وتحديد حالة السعر
    const hasVariants = extra_payload && Object.keys(extra_payload).length > 0;
    if (hasVariants) {
      setProductPrice("");
      setIsMoreOpen(true);
    } else {
      setProductPrice(Price?.toString() || "");
      setIsMoreOpen(false);
    }

    // 4. معالجة عرض الصورة
    if (Image) {
      // تحويل اسم الملف إلى رابط كامل للعرض في الـ img tag
      // تأكد من استيراد SUPABASE_STORAGE_URL من ملف الثوابت
      setImageSrc(formatProductImage(Image));
    } else {
      setImageSrc("");
    }
    
  } else {
    // حالة إضافة منتج جديد (Reset)
    setProductName("");
    setProductPrice("");
    setproductCategory("");
    setProductDescription("");
    setImageSrc(""); // تصفير الصورة
  }
}, [initialData]);

const [isProcessing, setIsProcessing] = useState(false);
const [isCompressing, setIsCompressing] = useState(false);


const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setIsProcessing(true); // تفعيل حالة التحميل

  try {
    const isHeic = file.type === "image/heic" || 
                   file.type === "image/heif" || 
                   file.name.toLowerCase().endsWith(".heic");

    let fileToProcess = file;

    if (isHeic) {
      const heic2any = (await import('heic2any')).default;
      const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
      fileToProcess = new File([blob as Blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
        type: "image/jpeg",
      });
    }

    // هنا يكمن الربط: تحديث الـ states هو ما يجعل المقص يرى الصورة فوراً
    setTempFile(fileToProcess); 
    setImageSrc(URL.createObjectURL(fileToProcess)); // المقص يستمع لهذا الـ state
    setIsCropping(true);
    onStartCrop?.();

  } catch (error) {
    console.error("خطأ:", error);
    toast.error("حدث خطأ أثناء معالجة الصورة.");
  } finally {
    setIsProcessing(false); // إيقاف التحميل مهما كانت النتيجة
  }
};


  

const handleCropSave = async () => {
  setIsCompressing(true); // بداية التحميل
  try {
    const croppedBlob = await getCroppedImg(imageSrc!, croppedAreaPixels);
    
    if (croppedBlob) {
      const fileToCompress = new File([croppedBlob], tempFile?.name || "product.jpg", { type: "image/jpeg" });

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(fileToCompress, options);

      setfile(compressedFile);
      setIsCropping(false);
      onStopCrop?.();
      toast.success("تم اعتماد وضغط الصورة بنجاح");
    }
  } catch (e) {
    console.error("Error during compression:", e);
    toast.error("خطأ في معالجة أو ضغط الصورة");
  } finally {
    setIsCompressing(false); // نهاية التحميل (سواء نجحت أو فشلت)
  }
};



  

  const handleAction = async () => {
  // 1. التحقق من البيانات (Validation)
  const isMissingPrice = !isMoreOpen && !productPrice;
  const isMissingImage = !imageSrc; // imageSrc هو الرابط الكامل للصورة

  if (!productName || !productCategory || isMissingPrice || isMissingImage) {
    return toast.error("يرجى التأكد من ملء جميع الحقول المطلوبة (الاسم، التصنيف، السعر، والصورة)");
  }

  setIsUploading(true);

  try {
    // 2. تحديد مسار الصورة النهائي
    let finalImagePath = initialData?.Image || ""; // نبدأ بالاسم القديم (إذا كان في وضع التعديل)

    // إذا قام المستخدم باختيار ملف جديد، نقوم برفعه
    if (file) {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('path', fileName); // نرسل الاسم الجديد
      
      const uploadResult = await uploadImageAction(formData);
      if (!uploadResult.success) throw new Error("فشل رفع الصورة إلى Supabase");
      
      finalImagePath = fileName; // نحدث المسار بالاسم الجديد
    } else if (!imageSrc) {
      // إذا قام المستخدم بحذف الصورة (imageSrc أصبح فارغاً)
      finalImagePath = ""; 
    }

    // 3. بناء جسم الطلب (Payload)
    const productPayload = {
      Title: productName,
      Price: !isMoreOpen ? (Number.parseFloat(productPrice) || 0) : 0,
      Image: finalImagePath, // اسم الملف الجديد أو القديم أو فارغ
     quantity:productQuantity,
     field_desc:productDescription,
      category: productCategory,
      options: variants,
      status: 'active'
    };

    // 4. تنفيذ العملية (Edit vs Add)
    if (isEditMode) {
  const { data, error } = await updateProductAction(initialData.id, productPayload, initialData.Image);
  
  if (error) throw new Error(error);

  // تحديث رابط الصورة في البيانات العائدة
  if (data && data[0] && data[0].Image) {
    data[0].Image = formatProductImage(data[0].Image);
  }
  
  toast.success("تم تحديث المنتج بنجاح! ✏️");
  hideDrawer(data[0]);
} else {
  // إضافة منتج جديد
  const { data, error } = await addProductAction(productPayload);
  if (error) throw new Error(error);

  // تحديث رابط الصورة في البيانات العائدة
  if (data && data[0] && data[0].Image) {
    data[0].Image = formatProductImage(data[0].Image);
  }
  
  toast.success("تمت الإضافة بنجاح! 🎉");

  if (onProductAdded) {
   // alert(JSON.stringify(data[0]))
    onProductAdded(data[0]);
  }
  
  // تصفير الحقول
  setProductName("");
  setProductPrice("");
  setproductCategory("");
  setImageSrc(null);
  setfile(null);
  setFileInputKey(Date.now());
}

  } catch (err: any) {
    console.error("Action Error:", err);
    toast.error("خطأ: " + (err.message || "فشل في تنفيذ العملية"));
  } finally {
    setIsUploading(false);
  }
};


const handleReset = () => {
  setImageSrc(null); // مسح الصورة من المعاينة
  setTempFile(null); 
  // إذا كان imageSrc يحتوي على رابط Blob، قم بتحريره
if (imageSrc && imageSrc.startsWith('blob:')) {
  URL.revokeObjectURL(imageSrc);}
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
          {isProcessing ? (
    <div className="flex items-center gap-2 text-blue-600 font-bold">
      <div className="w-5 h-5 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      جاري معالجة الصورة...
    </div>
  ) : (
    <span>اختر صورة المنتج</span>
  )}
       {!imageSrc ? (
  <input 
    type="file" 
    onChange={onFileChange} 
    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
  />
) : (
  !isCropping && (
    <div className="relative w-16 h-16 shrink-0 group">
      {/* تم استخدام fill بدلاً من تحديد أبعاد يدوية */}
      <Image 
        src={imageSrc} 
        alt="Preview" 
        fill
        sizes="64px"
        className="object-cover rounded-lg border border-slate-200 shadow-sm"
      />
      <button 
        onClick={handleReset}
        className="absolute -top-2 -right-2 bg-white/70 backdrop-blur-sm text-red-500 rounded-full p-1 
                   shadow-md border border-slate-200 
                   opacity-0 group-hover:opacity-100 
                   transition-all duration-300 ease-in-out
                   hover:bg-red-50 hover:text-red-600 hover:scale-110
                   focus:outline-none focus:ring-2 focus:ring-red-300"
        title="إزالة الصورة"
      >
        <Trash2 size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
)}



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
            setImageSrc(null);
            setFileInputKey(Date.now());
          }} 
          className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl"
        >
          إلغاء
        </button>

        <button 
  onClick={handleCropSave} 
  disabled={isCompressing} // تعطيل الزر أثناء المعالجة
  className={`flex-1 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all
    ${isCompressing ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
>
  {isCompressing ? (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="animate-spin h-4 w-4" /> جاري المعالجة...
    </span>
  ) : (
    "اعتماد الصورة"
  )}
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
  vvalue={productDescription || ""}
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
