"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";

// تعريف أنواع البيانات
interface CartContextType {
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  isOpenCart: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: any) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. تحميل البيانات من localStorage عند تشغيل التطبيق
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart data", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // 2. حفظ البيانات في localStorage كلما تغيرت السلة
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // 3. وظيفة الإضافة للسلة الذكية
  const addToCart = (product: any) => {
    // الهوية الفريدة للمنتج (إما cartItemId الذي يحتوي على الخيارات أو id المنتج)
    const uniqueId = product.cartItemId || product.id;

    // البحث عما إذا كان المنتج "بنفس الخيارات" موجود مسبقاً
    const existingItemIndex = cart.findIndex(
      (item) => (item.cartItemId || item.id) === uniqueId
    );

    if (existingItemIndex !== -1) {
      // السيناريو 1: المنتج موجود بنفس الخيارات، نحدث الكمية فقط
      const updatedCart = [...cart];
      const itemInCart = updatedCart[existingItemIndex];

      // التأكد من عدم تجاوز المخزون المتاح لهذا الخيار
      if (itemInCart.quantityCart < product.quantity) {
        updatedCart[existingItemIndex] = {
          ...itemInCart,
          quantityCart: itemInCart.quantityCart + 1,
        };
        setCart(updatedCart);
        openCart(); // فتح السلة لرؤية التحديث
      } else {
        alert("عذراً، لقد وصلت للحد الأقصى للمخزون المتوفر لهذا النوع.");
      }
    } else {
      // السيناريو 2: المنتج غير موجود أو موجود بخيارات مختلفة
      // يضاف كعنصر جديد تماماً
      setCart([...cart, { ...product, quantityCart: 1 }]);
      openCart();
    }
  };

  const openCart = () => setIsOpenCart(true);
  const closeCart = () => setIsOpenCart(false);

  return (
    <CartContext.Provider
      value={{ cart, setCart, isOpenCart, addToCart, openCart, closeCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
