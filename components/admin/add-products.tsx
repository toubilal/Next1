'use client'

import React, { useState, useEffect } from "react"
import { formatProductImage } from "@/utils/productUtils"; 
import { MoreInfo } from '@/components/admin/more-informations'
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import Cropper from 'react-easy-crop'
import { addProductAction, uploadImageAction, updateProductAction } from '@/app/actions/adminActions'
import { Loader2, Trash2, ChevronDown } from "lucide-react"
import Image from 'next/image'
import { getCroppedImg } from '@/utils/cropImage'

interface AddProductsProps {
  initialData?: any;
  onProductAdded?: (product: any) => void;
  onProductUpdate?: (id: string, updatedData: any) => void;
  categories: string[];
  hideDrawer?: (newProduct: any) => void;
  onStartCrop?: () => void;
  onStopCrop?: () => void;
}

export function Addproducts({ initialData, onProductAdded, categories, hideDrawer, onStartCrop, onStopCrop }: AddProductsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [productDescription, setProductDescription] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [variants, setVariants] = useState([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(!!initialData);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);

  const [file, setfile] = useState<File | null>(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setproductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (initialData) {
      const { Title = "", category = "", extra_payload = [], field_desc = "", Price = "", Image = "", quantity = "" } = initialData;
      setProductName(Title);
      setproductCategory(category);
      setProductDescription(field_desc);
      setProductQuantity(quantity?.toString() || "");
      setVariants(extra_payload);

      const hasVariants = extra_payload && (Array.isArray(extra_payload) ? extra_payload.length > 0 : Object.keys(extra_payload).length > 0);
      if (hasVariants) {
        setProductPrice("");
        setIsMoreOpen(true);
      } else {
        setProductPrice(Price?.toString() || "");
        setIsMoreOpen(false);
      }
      if (Image) setImageSrc(formatProductImage(Image));
    }
  }, [initialData]);

  const setextra_payload = (payload: any) => {
    const formattedVariants = payload.variants.map((v: any) => ({
      options: { color: v.color, storage: v.storage },
      price: Number(v.price),
      stock: Number(v.stock),
    }));
    setVariants(formattedVariants);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setproductCategory(value);
    if (value.length > 0) {
      const filtered = categories.filter(cat => cat.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      let fileToProcess = file;
      if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
        const heic2any = (await import('heic2any')).default;
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
        fileToProcess = new File([blob as Blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
      }
      setTempFile(fileToProcess);
      setImageSrc(URL.createObjectURL(fileToProcess));
      setIsCropping(true);
      onStartCrop?.();
    } catch (error) {
      toast.error("حدث خطأ أثناء معالجة الصورة.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropSave = async () => {
    setIsCompressing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc!, croppedAreaPixels);
      if (croppedBlob) {
        const fileToCompress = new File([croppedBlob], tempFile?.name || "product.jpg", { type: "image/jpeg" });
        const compressedFile = await imageCompression(fileToCompress, { maxSizeMB: 0.5, maxWidthOrHeight: 1280, useWebWorker: true });
        setfile(compressedFile);
        setImageSrc(URL.createObjectURL(compressedFile));
        setIsCropping(false);
        onStopCrop?.();
        toast.success("تم اعتماد الصورة");
      }
    } catch (e) {
      toast.error("خطأ في معالجة الصورة");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAction = async () => {
    if (!productName || !productCategory || (!isMoreOpen && !productPrice) || !imageSrc) {
      return toast.error("يرجى ملء الاسم، التصنيف، السعر، والصورة");
    }
    setIsUploading(true);
    try {
      let finalImagePath = initialData?.imageName || initialData?.Image || "";
      if (file) {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('path', fileName);
        const uploadResult = await uploadImageAction(formData);
        if (!uploadResult.success) throw new Error("فشل رفع الصورة");
        finalImagePath = fileName;
      }

      const productPayload = {
        Title: productName,
        Price: !isMoreOpen ? (Number(productPrice) || 0) : 0,
        Image: finalImagePath,
        quantity: productQuantity,
        field_desc: productDescription,
        category: productCategory,
        extra_payload: variants,
        status: initialData?.status || 'active'
      };

      if (initialData?.id) {
        const { data, error } = await updateProductAction(initialData.id, productPayload, initialData.imageName);
        if (error) throw new Error(error);
        toast.success("تم التحديث بنجاح");
        hideDrawer?.(data[0]);
      } else {
        const { data, error } = await addProductAction(productPayload);
        if (error) throw new Error(error);
        toast.success("تمت الإضافة بنجاح");
        onProductAdded?.(data[0]);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
  <motion.div className="max-w-5xl mx-auto space-y-6 mb-10 text-start" dir="rtl">
    <Toaster />
    <div className="pt-4 px-2">
      <h2 className="text-xl font-bold text-center text-text">
        {initialData?.id ? "تعديل بيانات المنتج" : "إضافة منتج جديد"}
      </h2>
    </div>

    <div className="space-y-4 px-2">
      <label className="text-sm font-bold text-muted block">صورة المنتج:</label>
      <div className="flex items-center gap-4">
        {!imageSrc ? (
          <div className="relative w-full">
            <input type="file" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className="w-full p-6 border-2 border-dashed border-border rounded-2xl flex flex-col items-center bg-surface-2">
              <span className="text-muted text-sm">اضغط لاختيار صورة</span>
            </div>
          </div>
        ) : (
          <div className="relative w-24 h-24 shrink-0 group">
            <Image src={imageSrc} alt="Preview" fill className="object-cover rounded-2xl border-2 border-primary/20 shadow-md" unoptimized />
            <button onClick={() => setImageSrc(null)} className="absolute -top-2 -inline-end-2 bg-error text-white rounded-full p-1 shadow-lg hover:bg-error">
              <Trash2 size={16} />
            </button>
          </div>
        )}
        {isProcessing && <div className="text-xs text-info animate-pulse font-bold">جاري المعالجة...</div>}
      </div>

      {isCropping && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex-1 relative">
            <Cropper image={imageSrc!} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} onZoomChange={setZoom} />
          </div>
          <div className="bg-surface p-6 rounded-t-3xl space-y-4">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex gap-3">
              <button onClick={() => { setIsCropping(false); onStopCrop?.(); setImageSrc(null); }} className="flex-1 py-3 text-sm font-bold text-muted bg-surface-2 rounded-xl">إلغاء</button>
              <button onClick={handleCropSave} disabled={isCompressing} className="flex-1 py-3 text-sm font-bold text-white bg-primary rounded-xl shadow-lg">
                {isCompressing ? <Loader2 className="animate-spin mx-auto" size={20} /> : "اعتماد الصورة"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 bg-surface rounded-2xl border border-border p-4 shadow-sm">
        <input placeholder="اسم المنتج" className="w-full p-4 bg-surface-2 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" value={productName} onChange={(e) => setProductName(e.target.value)} />

        <div className="relative">
          <input placeholder="الصنف" className="w-full p-4 bg-surface-2 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none" value={productCategory} onChange={handleCategoryChange} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
              {suggestions.map((s, i) => (
                <div key={i} className="p-3 hover:bg-surface-2 cursor-pointer text-sm font-bold border-b border-border last:border-none" onClick={() => { setproductCategory(s); setShowSuggestions(false); }}>{s}</div>
              ))}
            </div>
          )}
        </div>

        <textarea 
          placeholder="وصف المنتج..." 
          className="w-full p-4 bg-surface-2 border-none rounded-xl text-sm font-bold h-28 resize-none focus:ring-2 focus:ring-primary/20 outline-none"
          value={productDescription || ""}
          onChange={(e) => setProductDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <input placeholder="السعر" type="number" disabled={isMoreOpen} className={`p-4 rounded-xl text-sm font-bold outline-none border-none ${isMoreOpen ? 'bg-surface-2 text-muted' : 'bg-surface-2'}`} value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
          <input placeholder="الكمية" type="number" disabled={isMoreOpen} className={`p-4 rounded-xl text-sm font-bold outline-none border-none ${isMoreOpen ? 'bg-surface-2 text-muted' : 'bg-surface-2'}`} value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} />
        </div>

        <button onClick={() => setIsMoreOpen(!isMoreOpen)} className="w-full flex items-center justify-between p-4 bg-surface-2 rounded-xl text-sm font-bold text-text">
          <span>إضافة متغيرات (الألوان والمقاسات)</span>
          <ChevronDown size={18} className={`transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isMoreOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <MoreInfo initialData={{ variants }} setextra_payload={setextra_payload} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={handleAction} disabled={isUploading} className="w-full p-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-transform disabled:bg-muted">
        {isUploading ? <Loader2 className="animate-spin mx-auto" /> : (initialData?.id ? "تحديث البيانات" : "حفظ المنتج")}
      </button>
    </div>
  </motion.div>
);
}
