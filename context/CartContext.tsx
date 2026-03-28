"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";

interface CartContextType {
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  isOpenCart: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: any) => void; // أضفت البارامتر هنا
}

export const CartContext = createContext<CartContextType>({
  cart: [],
  setCart: () => {},
  isOpenCart: false,
  openCart: () => {},
  closeCart: () => {},
  addToCart: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);
  const [isOpenCart, setIsOpenCart] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // لمنع مسح البيانات عند أول تحميل

  // 1. تحميل البيانات عند البداية فقط
  useEffect(() => {
    const data = localStorage.getItem("cart");
    if (data) {
      try {
        setCart(JSON.parse(data));
      } catch (e) {
        console.error("خطأ في قراءة بيانات السلة", e);
      }
    }
    setIsInitialized(true); // نؤكد أننا انتهينا من التحميل الأولي
  }, []);

  // 2. الحفظ في الـ Storage فقط بعد التأكد من انتهاء التحميل الأولي
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (product: any) => {
    const exists = cart.find((item) => item.id === product.id);

    if (!exists) {
      // نضيف المنتج مع كمية افتراضية 1
      setCart([...cart, { ...product, quantity: 1 }]);
      openCart();
    } else {
      // إذا كان موجوداً، نزيد الكمية بدلاً من إظهار alert (أفضل لتجربة المستخدم)
      const updated = cart.map(item => 
        item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      );
      setCart(updated);
      openCart();
    }
  };

  const openCart = () => setIsOpenCart(true);
  const closeCart = () => setIsOpenCart(false);

  return (
    <CartContext.Provider value={{ cart, setCart, isOpenCart, addToCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}
