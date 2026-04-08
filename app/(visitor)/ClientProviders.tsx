"use client";
import React,{ useState } from "react";
import { Toaster } from 'react-hot-toast';
import { VisitorDrawer } from "@/components/store/drawer";
import { Cart } from '@/components/store/Cart';
import { CartProvider } from "@/context/CartContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartProvider>
      <Toaster />
      <Cart isOpen={isCartOpen} onClose={closeCart} />
      <VisitorDrawer isAdmin={false} />
      <main className="p-4">
        {children}
      </main>
    </CartProvider>
  );
}
