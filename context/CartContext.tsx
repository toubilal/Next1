"use client";
import React,{ createContext, useState, useEffect, ReactNode } from "react";

interface CartContextType {
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  isOpenCart: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart:()=> void;
}

export const CartContext = createContext<CartContextType>({
  cart: [],
  setCart: () => {},
  isOpenCart: false,
  openCart: () => {},
  closeCart: () => {},addToCart:()=>{},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any[]>([]);
  const [isOpenCart, setIsOpenCart] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("cart");
    setCart(data ? JSON.parse(data) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

const addToCart = (product) => {
    // تحقق إذا المنتج موجود بالفعل
    const exists = cart.some((item) => item.id === product.id);

    if (!exists) {
      setCart([...cart, product]); // أضف المنتج
      openCart(); // فتح السلة إذا أردت
    } else {
      alert("المنتج موجود بالفعل في السلة");
    }
  };
  const openCart = () => setIsOpenCart(true);
  const closeCart = () => setIsOpenCart(false);

  return (
    <CartContext.Provider value={{ cart, setCart, isOpenCart, addToCart,openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}