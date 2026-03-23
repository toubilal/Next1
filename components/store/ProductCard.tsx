"use client";
import React,{useState} from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {Eye, X, Edit3, Heart,Archive, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: any;
  isAdmin?: boolean;
  isActive?: boolean;
  setSelectedId?: (id: string | null) => void;
  handleDelete?: (id: string, title: string, img: string) => void;
  setEditingProduct?: (product: any) => void;
  setIsDrawerOpen?: (open: boolean) => void;
  handleArchive?: (id: string, nextStatus: string) => void;
  isLiked?:boolean;
likedProduct?:(id:string,isLiked:boolean)=> void;
handleProductClick?:(product:[])=>void
}

export const ProductCard = ({
  product,
  isAdmin = false,
  isActive = false,
  setSelectedId,
  setEditingProduct,
  setIsDrawerOpen,
  handleArchive,isLiked=false,likedProduct,priority,
  handleProductClick
}: ProductCardProps) => {
const [isFavorite, setIsFavorite] = useState(isLiked);
const [isImageLoaded, setIsImageLoaded] = useState(false);
  return (
  <motion.div
    layout
    className="relative flex flex-col bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm transition-all mb-6"
  >
    {/* 1. Header (Brand Info) */}
    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50" dir="rtl">
      <div className="flex items-center">
        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
          {product.Brand?.[0] || "V"}
        </div>
        <span className="mr-2 text-xs font-bold text-slate-800">{product.Brand || "VELOUR"}</span>
      </div>
      
      {/* شارة الأرشفة تظهر للأدمن بوضوح */}
      {isAdmin && product.status === 'archived' && (
        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">مؤرشف</span>
      )}
    </div>

    {/* 2. Media Area (Image) */}
    <div className={`relative w-full h-64 overflow-hidden ${!isImageLoaded ? 'animate-pulse bg-slate-200' : ''}`}
       onClick={() => !isAdmin && handleProductClick(product)}
    >
  <Image
    src={product.Image}
    fill
    alt={product.Title}
    priority={priority} 
    onLoadingComplete={() => setIsImageLoaded(true)}
    // قمنا بحذف أي كود لـ rounded من هنا
    className={`object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
    unoptimized
 
  />

      
      {/* --- أزرار الأدمن: تظهر دائماً الآن لسهولة التحكم --- */}
      {isAdmin && (
        <div className="absolute top-2 left-2 z-30 flex flex-col gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleDelete?.(product.id, product.Title, product.Image); }}
            className="p-2 bg-white/90 text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors">
            <X size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setEditingProduct?.(product); setIsDrawerOpen?.(true); }}
            className="p-2 bg-white/90 text-blue-600 rounded-full shadow-md hover:bg-blue-50 transition-colors">
            <Edit3 size={16} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleArchive?.(product.id, product.status === 'active' ? 'archived' : 'active'); }}
            className={`p-2 rounded-full shadow-md transition-colors ${product.status === 'archived' ? 'bg-amber-500 text-white' : 'bg-white/90 text-amber-500'}`}>
            <Archive size={16} />
          </button>
        </div>
      )}
    </div>

    {/* 3. شريط التفاعل (Action Bar) للزائر */}
    {!isAdmin && (
      <div className="px-3 pt-3 flex items-center justify-between">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite); 
            likedProduct(product.id, isFavorite);
          }}
          className="transition-transform active:scale-125"
        >
          <Heart 
            size={24} 
            color={isFavorite ? "#ed4956" : "#262626"} 
            fill={isFavorite ? "#ed4956" : "none"} 
          />
        </button>
        <ShoppingCart size={24} color="#262626" onClick={(e) => { e.stopPropagation(); addToCart?.(product); }} className="cursor-pointer" />
      </div>
    )}

    {/* 4. المعلومات تحت الصورة (Caption Style) */}
    <div className="px-3 py-2 text-right" dir="rtl">
      {/* اسم المنتج */}
      <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">
        {product.Title}
      </h3>
      
      {/* السعر */}
      <div className="text-blue-600 font-black text-lg">
        {product.Price} <small className="text-[10px] font-bold">د.ج</small>
      </div>

      {/* إحصائيات الأدمن فقط تظهر تحت السعر */}
      {isAdmin && (
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-pink-500">
            <Heart size={14} fill="currentColor" />
            <span className="text-xs font-bold">{product.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Eye size={14} />
            <span className="text-xs font-bold">{product.views_count || 0}</span>
          </div>
        </div>
      )}
    </div>

    {/* زر السلة العريض للزائر فقط كخيار إضافي أسفل البطاقة */}
    {!isAdmin && (
      <div className="px-3 pb-3 mt-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); addToCart?.(product); }}
          className="w-full py-2 bg-slate-900 text-white rounded-md font-bold text-xs hover:bg-slate-800 active:scale-[0.98] transition-all"
        >
          شراء الآن
        </button>
      </div>
    )}
  </motion.div>
);

};

export default ProductCard;
