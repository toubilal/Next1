"use client";
import { useState } from "react";
import Link from "next/link";
import { Home, PlusCircle, Package, Settings, BarChart3, LogOut, Menu, X, Bell ,ShoppingCart} from "lucide-react"; // استخدام مكتبة icons أفضل
import { useContext } from "react";
import { CartContext } from "@/context/CartContext"
import {Cart} from'@/components/store/Cart'

interface DrawerProps {
  isAdmin?: boolean; 
  isCartOpen?:boolean;
}

export function Drawer({ isAdmin = false,isCartOpen=false }: DrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
const { isOpenCart,openCart,cart, setCart,closeCart } = useContext(CartContext);


  // 1. تعريف الروابط العامة (للجميع)
  const publicItems = [
    { name: "الرئيسية", path: "/", icon: <Home size={20} /> },
  ];

  // 2. تعريف روابط الإدارة (تظهر فقط للأدمن)
  const adminItems = [
    { name: "إدارة المنتجات", path: "/products", icon: <Package size={20} /> },
    { name: "الإحصائيات", path: "/stats", icon: <BarChart3 size={20} /> }, // الصفحة التي سنبنيها غداً
    { name: "الإعدادات", path: "/settings", icon: <Settings size={20} /> },
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
          {isAdmin && (
             <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          )}
         
        <Link 
  href={!isAdmin ? "/products" : "/"} 
  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors active:scale-95 ${
    isAdmin 
      ? 'bg-blue-600 text-white shadow-sm' // شكل احترافي للأدمن
      : 'bg-slate-100 text-slate-500 hover:bg-slate-200' // شكل هادئ للزائر
  }`}
>
  {!isAdmin ? "Go Admin" : "go Guest "}
</Link>
{!isAdmin && (
             <button
             onClick={() => (isOpenCart ? closeCart() : openCart())}
             className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative">
  <ShoppingCart size={20} />
  <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 text-[10px] flex items-center justify-center bg-red-500 text-white rounded-full border-2 border-white">
   { cart.length}
  </span>
</button> 
          )}
         
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
            {isAdmin ? "Admin Mode" : "Guest"}
          </div>
        </div>
      </header>

      {/* --- الـ Drawer الجانبي --- */}
      <div className={`fixed inset-y-0 right-0 z-[100] w-72 bg-white shadow-2xl transform 
        ${isOpen ? "translate-x-0" : "translate-x-full"} 
        transition-transform duration-300 ease-in-out`} dir="rtl">
        
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

            {/* عرض روابط الأدمن فقط إذا كان isAdmin true */}
            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 mb-2 px-3 tracking-widest uppercase">لوحة التحكم</p>
                {adminItems.map((item, index) => (
                  <Link 
                    key={index} 
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-3 text-slate-700 hover:bg-primary/5 hover:text-primary rounded-xl transition-all font-semibold"
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* زر الخروج (يظهر للأدمن فقط) */}
          {isAdmin && (
            <div className="border-t pt-4">
               <button className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold">
                  <LogOut size={20} /> تسجيل الخروج
               </button>
            </div>
          )}
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
