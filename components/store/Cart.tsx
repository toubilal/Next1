"use client";
import Image from 'next/image';
import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "@/context/CartContext";
import Link from "next/link";
export function Cart() {
  const { isOpenCart, closeCart, cart, setCart } = useContext(CartContext);

  const removeItem = (id: string | number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
  };

  const updateQuantity = (id: string | number, delta: number) => {
    const updated = cart.map(item => {
      if (item.id === id) {
        const currentQty = item.quantity || 1;
        const newQty = Math.max(1, currentQty + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(updated);
  };

  return (
    <AnimatePresence>
      {isOpenCart && (
        <>
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
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                  
                  {/* 1. الصورة (يسار) */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                    <Image
                      src={item.Image || "/placeholder.jpg"}
                      alt={item.Title || "product"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* 2. أزرار الكمية (عمودية بجانب الصورة بنفس ارتفاعها) */}
                  <div className="flex flex-col justify-between h-16 w-8 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold text-xs"
                    >
                      +
                    </button>
                    <span className="text-[10px] font-black text-center bg-white py-0.5 border-y border-gray-100">
                      {item.quantity || 1}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-full flex items-center justify-center hover:bg-gray-200 text-gray-600 font-bold text-xs"
                    >
                      -
                    </button>
                  </div>

                  {/* 3. الاسم والسعر (المنتصف) */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-[11px] truncate">{item.Title}</h3>
                    <p className="text-blue-600 font-black text-xs mt-1">
                      {item.Price} <span className="text-[9px]">د.ج</span>
                    </p>
                  </div>

                  {/* 4. زر الحذف (أقصى اليمين متوسط عمودياً) */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                   {cart.reduce((total, item) => total + (Number(item.Price) * (item.quantity || 1)), 0)} <span className="text-xs">د.ج</span>
                </span>
              </div><Link
  href={cart?.length > 0 ? "/checkout" : "#"}
  className={`block w-full py-3.5 rounded-xl text-sm font-black text-center transition-all
    ${
      cart?.length > 0
        ? "bg-black text-white active:scale-95"
        : "bg-gray-400 text-gray-200 cursor-not-allowed"
    }`}
  onClick={(e) => {
    if (cart?.length === 0) e.preventDefault();
  }}
>
  إتمام الطلب
</Link>
              
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
