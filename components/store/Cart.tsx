"use client";
import Image from 'next/image';
import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CartContext } from "@/context/CartContext";

export function Cart() {
  const { isOpenCart, closeCart, cart, setCart } = useContext(CartContext);

  const removeItem = (id: string | number) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
  };

  return (
    <AnimatePresence>
      {isOpenCart && (
        <>
          {/* الخلفية المظلمة - z-90 لتكون فوق النافبار وتحت السلة */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* جسم السلة - العرض w-72 والـ z-100 ليكون فوق كل شيء */}
          <motion.div
            className="fixed top-0 left-0 w-80 h-full bg-white z-[100] shadow-2xl p-4 flex flex-col"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.5 
            }}
          >
            {/* الرأس */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-black text-gray-800">السلة 🛒</h2>
              <button 
                onClick={closeCart} 
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* محتوى السلة */}
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                <p className="text-sm font-medium">سلتك فارغة</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-center bg-gray-50 p-2 rounded-xl border border-gray-100"
                  >
                    {/* صورة المنتج */}
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                      <Image
                        src={item.Image || "/placeholder.jpg"}
                        alt={item.Title || "product"}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>

                    {/* تفاصيل المنتج */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-xs truncate">{item.Title}</h3>
                      <p className="text-blue-600 font-black text-xs mt-0.5">
                        {item.Price} <span className="text-[9px]">د.ج</span>
                      </p>
                    </div>

                    {/* زر الحذف */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* التذييل */}
            <div className="mt-auto pt-4 border-t space-y-3">
              <div className="flex justify-between items-center font-bold text-sm px-1">
                <span className="text-gray-500">الإجمالي:</span>
                <span className="text-green-700">
                   {cart.reduce((total, item) => total + Number(item.Price), 0)} د.ج
                </span>
              </div>
              
              <button
                onClick={closeCart}
                className="w-full bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 active:scale-95 transition-all"
              >
                إتمام الطلب
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
