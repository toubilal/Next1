"use client";
import { useState, useContext } from "react";
import Link from "next/link";
import { Home, ShoppingCart, Menu, X } from "lucide-react";
import { CartContext } from "@/context/CartContext";

interface DrawerProps {
  isCartOpen?: boolean;
}

export function VisitorDrawer({ isCartOpen = false }: DrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, openCart, closeCart, isOpenCart } = useContext(CartContext);

  // الروابط العامة للزائر
  const publicItems = [
    { name: "الرئيسية", path: "/", icon: <Home size={20} /> },
  ];

  return (
    <>
      {/* --- الـ Navbar العلوي --- */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-[80]" dir="rtl">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* زر عربة التسوق */}
          <button
            onClick={() => (isOpenCart ? closeCart() : openCart())}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative"
          >
            <ShoppingCart size={20} />
            <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 text-[10px] flex items-center justify-center bg-red-500 text-white rounded-full border-2 border-white">
              {cart.length}
            </span>
          </button>

          <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
            Guest
          </div>
        </div>
      </header>

      {/* --- الـ Drawer الجانبي --- */}
      <div
        className={`fixed inset-y-0 right-0 z-[100] w-72 bg-white shadow-2xl transform 
        ${isOpen ? "translate-x-0" : "translate-x-full"} 
        transition-transform duration-300 ease-in-out`}
        dir="rtl"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-xl font-black text-primary">القائمة</h2>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {/* عرض الروابط العامة */}
            {publicItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-all font-semibold"
              >
                <span className="text-primary">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* الخلفية المظلمة */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[90] backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}