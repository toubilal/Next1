"use client";
import React, { useState, useContext, useMemo } from 'react';
import { CartContext } from '@/context/CartContext';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Edit3, Heart, Archive, ShoppingCart, ChevronDown } from 'lucide-react';

interface ProductCardProps {
  product: any;
  isAdmin?: boolean;
  setEditingProduct?: (product: any) => void;
  handleDelete?: (id: string, title: string, img: string) => void;
  setIsDrawerOpen?: (open: boolean) => void;
  handleArchive?: (id: string, nextStatus: string) => void;
  isLiked?: boolean;
  likedProduct?: (id: string, isLiked: boolean) => void;
  priority?: boolean;
  handleProductClick?: (product: any) => void;
}

export const ProductCard = ({
  product,
  isAdmin = false,
  setEditingProduct,
  handleDelete,
  setIsDrawerOpen,
  handleArchive,
  isLiked = false,
  likedProduct,
  priority,
  handleProductClick
}: ProductCardProps) => {
  const { addToCart } = useContext(CartContext);
  const [isFavorite, setIsFavorite] = useState(isLiked);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // --- حالات الاختيار (Selection State) ---
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // فك بيانات extra_payload للتعامل مع المتغيرات (Storage/Color)
  const variants = useMemo(() => {
    try {
      const payload = typeof product.extra_payload === 'string' 
        ? JSON.parse(product.extra_payload) 
        : product.extra_payload;
      return Array.isArray(payload) ? payload : (payload?.variants || []);
    } catch { return []; }
  }, [product.extra_payload]);

  const allStorages = useMemo(() => [...new Set(variants.map((v: any) => v.options?.storage))].filter(Boolean), [variants]);
  
  const availableColors = useMemo(() => {
    if (!selectedStorage) return [];
    return variants
      .filter((v: any) => v.options?.storage === selectedStorage)
      .map((v: any) => v.options?.color)
      .filter(Boolean);
  }, [selectedStorage, variants]);

  const handleAddToCartWithValidation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allStorages.length > 0 && !selectedStorage) {
      alert("يرجى اختيار السعة أولاً"); return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      alert("يرجى اختيار اللون"); return;
    }

    const matchedVariant = variants.find((v: any) => 
      v.options?.storage === selectedStorage && 
      v.options?.color === selectedColor
    );

    if (matchedVariant) {
      const productWithChoices = {
        ...product,
        cartItemId: `${product.id}-${selectedStorage}-${selectedColor}`,
        selectedOptions: { storage: selectedStorage, color: selectedColor },
        Price: matchedVariant.price , 
        quantity: matchedVariant.stock || 0
      };

      if (productWithChoices.quantity > 0) {
        addToCart?.(productWithChoices);
      } else {
        alert("عذراً، هذا الخيار غير متوفر حالياً (نفذت الكمية)");
      }
    } else {
      addToCart?.(product);
    }
  };

  return (
    <motion.div layout className="relative flex flex-col bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm mb-6 transition-all">
      
      {/* 1. Header & Brand */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-50" dir="rtl">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
            {product.Brand?.[0] || "V"}
          </div>
          <span className="mr-2 text-xs font-bold text-slate-800">{product.Brand || "Brand"}</span>
        </div>
        {isAdmin && product.status === 'archived' && (
          <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">مؤرشف</span>
        )}
      </div>

      {/* 2. Media Area (Image) */}
      <div 
        className={`relative w-full h-64 overflow-hidden cursor-pointer ${!isImageLoaded ? 'animate-pulse bg-slate-200' : ''}`} 
        onClick={() => handleProductClick?.(product)}
      >
        
        <Image 
          src={product.Image} 
          fill 
          alt={product.Title} 
          priority={priority} 
          onLoadingComplete={() => setIsImageLoaded(true)} 
          className={`object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`} 
          unoptimized 
        />
        
        {isAdmin && (
          <div className="absolute top-2 left-2 z-30 flex flex-col gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleDelete?.(product.id, product.Title, product.imageName); }}
              className="p-2 bg-white/90 text-red-500 rounded-full shadow-md hover:bg-red-50 active:scale-90 transition-all">
              <X size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setEditingProduct?.(product); setIsDrawerOpen?.(true); }}
              className="p-2 bg-white/90 text-blue-600 rounded-full shadow-md hover:bg-blue-50 active:scale-90 transition-all">
              <Edit3 size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleArchive?.(product.id, product.status === 'active' ? 'archived' : 'active'); }}
              className={`p-2 rounded-full shadow-md transition-all active:scale-90 ${product.status === 'archived' ? 'bg-amber-500 text-white' : 'bg-white/90 text-amber-500'}`}>
              <Archive size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 3. Interaction Bar (Visitors Only) */}
      {!isAdmin && (
        <div className="px-3 pt-3 flex items-center justify-between">
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              const nextState = !isFavorite;
              setIsFavorite(nextState); 
              likedProduct?.(product.id, nextState); 
            }}
            className="active:scale-125 transition-transform"
          >
            <Heart size={22} color={isFavorite ? "#ed4956" : "#262626"} fill={isFavorite ? "#ed4956" : "none"} />
          </button>
          <ShoppingCart size={22} color="#262626" />
        </div>
      )}

      {/* 4. Product Info */}
      <div className="px-3 py-2 text-right" dir="rtl">
        <h3 className="text-sm font-bold text-slate-900 mb-1 leading-tight">{product.Title}</h3>
        
        <div className="text-blue-600 font-black text-lg mb-2">
          {product.Price} <small className="text-[10px]">د.ج</small>
        </div>

        {/* Variants Dropdowns - Visitors Only */}
        {!isAdmin && variants.length > 0 && (
          <div className="space-y-2 mb-3">
            <div className="relative">
              <select 
                value={selectedStorage}
                onChange={(e) => { setSelectedStorage(e.target.value); setSelectedColor(""); }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold appearance-none outline-none focus:border-blue-500"
              >
                <option value="">اختر السعة/المقاس...</option>
                {allStorages.map((s: any) => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute left-2 top-3 text-slate-400 pointer-events-none" />
            </div>

            <AnimatePresence>
              {selectedStorage && availableColors.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="relative">
                  <select 
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold appearance-none outline-none focus:border-blue-500"
                  >
                    <option value="">اختر اللون...</option>
                    {availableColors.map((c: any) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute left-2 top-3 text-slate-400 pointer-events-none" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Admin Stats */}
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

      {/* 5. Buy Button - Visitors Only */}
      {!isAdmin && (
        <div className="px-3 pb-3 mt-auto">
          <button 
            onClick={handleAddToCartWithValidation}
            className="w-full py-2.5 bg-slate-900 text-white rounded-sm font-bold text-xs active:scale-[0.97] transition-all hover:bg-slate-800"
          >
            إضافة إلى السلة
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ProductCard;
