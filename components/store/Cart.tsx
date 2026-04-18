"use client";
import Image from 'next/image';
import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "@/context/CartContext";
import Link from "next/link";

export function Cart() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => { setToast(null); }, 2000);
  };

  const { isOpenCart, closeCart, cart, setCart } = useContext(CartContext);

  const removeItem = (id: string | number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
  };

  const updateQuantity = (id: string | number, delta: number) => {
    const updated = cart.map(item => {
      if (item.id !== id) return item;
      const currentQty = item.quantityCart || 1;
      if (delta > 0 && currentQty >= item.quantity) {
        showToast("وصلت للحد الأقصى", "error");
        return item;
      }
      if (delta < 0 && currentQty <= 1) return item;
      return { ...item, quantityCart: currentQty + delta };
    });
    setCart(updated);
  };

  return (
    <AnimatePresence>
      {isOpenCart && (
        <>
          {toast && (
            <div className={`toast ${toast.type}`}>
              {toast.message}
            </div>
          )}

          <motion.div
            className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed top-0 left-0 w-80 h-full bg-white z-[100] shadow-2xl p-4 flex flex-col"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* الرأس */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-black text-gray-800">السلة 🛒</h2>
              <button onClick={closeCart} className="text-gray-400 hover:text-red-500">✕</button>
            </div>

            {/* المحتوى */}
            <div className="flex-1 overflow-y-auto space-y-3 overscroll-contain custom-scrollbar">
              {cart.map((item) => (
                <div key={item.cartItemId || item.id} className="flex items-start gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                  
                  {/* 1. الصورة */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                    <Image
                      src={item.Image || "/placeholder.jpg"}
                      alt={item.Title || "product"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* 2. أزرار الكمية */}
                  <div className="flex flex-col justify-between h-16 w-8 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, 1)} className="h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold text-xs">+</button>
                    <span className="text-[10px] font-black text-center bg-white py-0.5 border-y border-gray-100">{item.quantityCart || 1}</span>
                    <button onClick={() => updateQuantity(item.id, -1)} className="h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold text-xs">-</button>
                  </div>

                  {/* 3. الاسم، الخيارات، والسعر */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="font-bold text-gray-800 text-[11px] truncate">{item.Title}</h3>
                    
                    {/* عرض الخيارات المختارة (Storage & Color) */}
                    {item.selectedOptions && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedOptions.storage && (
                          <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                            {item.selectedOptions.storage}
                          </span>
                        )}
                        {item.selectedOptions.color && (
                          <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                            {item.selectedOptions.color}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-blue-600 font-black text-xs mt-1">
                      {item.Price} <span className="text-[9px]">د.ج</span>
                    </p>
                  </div>

                  {/* 4. زر الحذف */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 self-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* التذييل */}
            <div className="mt-auto pt-4 border-t space-y-3">
              <div className="flex justify-between items-center font-bold text-sm px-1">
                <span className="text-gray-500">الإجمالي:</span>
                <span className="text-green-700 font-black text-lg">
                   {cart.reduce((total, item) => total + (Number(item.Price) * (item.quantityCart || 1)), 0)} <span className="text-xs">د.ج</span>
                </span>
              </div>
              
              <Link
                href={cart?.length > 0 ? "/checkout" : "#"}
                className={`block w-full py-3.5 rounded-xl text-sm font-black text-center transition-all
                  ${cart?.length > 0 ? "bg-black text-white active:scale-95" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
                onClick={(e) => { if (cart?.length === 0) e.preventDefault(); closeCart(); }}
              >
                إتمام الطلب (Checkout)
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
