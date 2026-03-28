'use client'

import React, { useState, useEffect } from "react"
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import {addProductAction,updateProductAction} from'@/app/actions/adminActions'
import { Loader2, Plus, Image as ImageIcon, X, Edit3 } from "lucide-react"

import { supabase } from '@/app/supabaseClient'
import { uploadImageAction } from '@/app/actions'
import { getCroppedImg } from '@/utils/cropImage'

interface AddProductsProps {
  initialData?: any;
  onProductAdded: (product: any) => void;
  onProductUpdate?: (id: string, updatedData: any) => void;
  categories: string[];
  hideDrawer?:(newProduct:any)=>void// أضف هذا السطر
}

export function Addproducts({ initialData, onProductAdded, onProductUpdate, categories,hideDrawer }: AddProductsProps){
  
  useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
const [allCategories, setAllCategories] = useState<string[]>([]);
const [suggestions, setSuggestions] = useState<string[]>([]);
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
      toast.success("تم اعتماد الصورة");
    }
  } catch (e) {
    toast.error("خطأ في القص");
  }
};

  

  const handleAction = async () => {
    if (!productName || !productPrice || !productCategory || (!isEditMode && !file)) {
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
        Price: parseFloat(productPrice),
        Image: finalImagePath,
        category: productCategory,
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
      // تم الربط بـ isCropping مباشرة لتعطيل السحب
      drag={isCropping ? false : "y"} 
      dragConstraints={{ top: 0, bottom: 0 }}
      className="max-w-md mx-auto space-y-4 p-6 bg-white rounded-xl shadow-lg border border-gray-100"
    >
      <Toaster />
      <h2 className="text-xl font-bold text-center text-black">
        {isEditMode ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}
      </h2>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">صورة المنتج:</label>
        <input 
          type="file" 
          onChange={onFileChange} 
          key={fileInputKey}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />

        {isCropping && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <div 
              className="relative flex-1 bg-[#1a1a1a]"
              // لمنع أي تداخل أحداث إضافي
              onPointerDownCapture={e => e.stopPropagation()}
            >
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
            <div className="bg-white p-6 rounded-t-3xl space-y-4">
              <input 
                type="range" 
                value={zoom} 
                min={1} 
                max={3} 
                step={0.1} 
                onChange={(e) => setZoom(Number(e.target.value))} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
              />
              <div className="flex gap-3">
               <button 
  onClick={() => {
    setIsCropping(false);
    setTempFile(null); // مسح الملف المؤقت
    setFileInputKey(Date.now()); // إعادة تصفير الـ Input ليختفي الاسم
  }} 
  className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl"
>
  إلغاء
</button>
<button onClick={handleCropSave} className="flex-2 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg">اعتماد الصورة</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <input 
        placeholder="اسم المنتج" 
        className="w-full p-3 border border-slate-300 rounded-xl bg-white text-black placeholder:text-slate-400 focus:border-primary outline-none transition-all shadow-sm"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />

      <input 
        placeholder="السعر" 
        type="number"
        className="w-full p-3 border border-slate-300 rounded-xl bg-white text-black outline-none transition-all shadow-sm"
        value={productPrice}
        onChange={(e) => setProductPrice(e.target.value)}
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
      {showSuggestions && suggestions.length > 0 && (
    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto">
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

      <button 
        onClick={handleAction}
        disabled={isUploading}
        className={`w-full text-black p-4 rounded-xl font-extrabold text-sm uppercase tracking-widest transition-all shadow-lg ${
          isUploading ? 'bg-slate-200 cursor-not-allowed' : 'bg-primary hover:bg-[#b8952e] active:scale-95'
        }`}
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" /> جاري الحفظ...
          </span>
        ) : isEditMode ? "تحديث المنتج" : "حفظ في السيرفر"}
      </button>
    </motion.div>
  );
}
