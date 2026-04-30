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
    const updated = cart.filter((item) => (item.cartItemId || item.id) !== id);
    setCart(updated);
  };

  const updateQuantity = (id: string | number, delta: number) => {
    const updated = cart.map(item => {
      if ((item.cartItemId || item.id) !== id) return item;
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
          className="fixed top-0 start-0 w-80 h-full bg-surface z-[100] shadow-2xl p-4 flex flex-col"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          dir="rtl"
        >

          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
            <h2 className="text-xl font-black text-text">السلة 🛒</h2>
            <button onClick={closeCart} className="text-muted hover:text-error p-1">✕</button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-3 overscroll-contain custom-scrollbar">

            {cart.map((item) => (
              <div key={item.cartItemId || item.id} className="flex items-start gap-3 bg-surface p-2 rounded-xl border border-border shadow-sm">

                {/* Image */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <Image
                    src={item.Image || "/placeholder.jpg"}
                    alt={item.Title || "product"}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Quantity */}
                <div className="flex flex-col justify-between h-16 w-8 bg-surface-2 rounded-lg border border-border overflow-hidden">
                  <button onClick={() => updateQuantity(item.cartItemId||item.id, 1)} className="h-full flex items-center justify-center hover:bg-surface-2 text-text font-bold text-xs">+</button>
                  <span className="text-[10px] font-black text-center bg-surface py-0.5 border-y border-border">{item.quantityCart || 1}</span>
                  <button onClick={() => updateQuantity(item.cartItemId||item.id, -1)} className="h-full flex items-center justify-center hover:bg-surface-2 text-text font-bold text-xs">-</button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-0.5 text-start">
                  <h3 className="font-bold text-text text-[11px] truncate">{item.Title}</h3>

                  {item.selectedOptions && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedOptions.storage && (
                        <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold border border-primary/20">
                          {item.selectedOptions.storage}
                        </span>
                      )}
                      {item.selectedOptions.color && (
                        <span className="text-[8px] bg-surface-2 text-muted px-1.5 py-0.5 rounded font-bold border border-border">
                          {item.selectedOptions.color}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-primary font-black text-xs mt-1">
                    {item.Price} <span className="text-[9px]">د.ج</span>
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.cartItemId||item.id)}
                  className="p-2 text-muted hover:text-error self-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>

              </div>
            ))}

          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-border space-y-3">

            <div className="flex justify-between items-center font-bold text-sm px-1">
              <span className="text-muted text-start">الإجمالي:</span>
              <span className="text-primary font-black text-lg">
                {cart.reduce((total, item) => total + (Number(item.Price) * (item.quantityCart || 1)), 0)}
                <span className="text-xs"> د.ج</span>
              </span>
            </div>

            <Link
              href={cart?.length > 0 ? "/checkout" : "#"}
              className={`block w-full py-3.5 rounded-xl text-sm font-black text-center transition-all
                ${cart?.length > 0 ? "bg-primary text-white active:scale-95" : "bg-muted text-white/60 cursor-not-allowed"}`}
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
