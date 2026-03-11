"use client";
import { useState } from "react";
import Link from "next/link"; // لاستخدام التنقل السريع بين الصفحات

export  function Drawer() {
  const [isOpen, setIsOpen] = useState(false);

  // قائمة العناصر لتسهيل الإضافة والتعديل مستقبلاً
  const menuItems = [
    { name: "الرئيسية", path: "/", icon: "🏠" },
    { name: "إضافة منتج", path: "/add-product", icon: "➕" },
    { name: "المخزن", path: "/inventory", icon: "📦" },
    { name: "الإعدادات", path: "/settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* --- الـ Navbar (الشريط العلوي) --- */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b sticky top-0 z-[80]">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-bold text-gray-800">متجري</h1>
        </div>

        {/* يمكنك إضافة عناصر هنا تظهر في الـ Navbar مباشرة (مثل أيقونة الإشعارات أو الملف الشخصي) */}
        <div className="flex items-center gap-4">
          <button className="text-xl">🔔</button>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
            Admin
          </div>
        </div>
      </header>

      {/* --- الـ Drawer (القائمة الجانبية) --- */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-72 bg-white shadow-2xl transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        transition-transform duration-300 ease-in-out`}>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <span>
                
               {/*عنوان Drawer*/}
              
              </span> 
            </h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.path}
                onClick={() => setIsOpen(false)} // يغلق القائمة عند الضغط على رابط
                className="flex items-center gap-4 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all font-medium"
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* قسم إضافي في أسفل القائمة */}
          <div className="absolute bottom-10 left-6 right-6">
             <button className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-medium">
                <span>🚪</span> تسجيل الخروج
             </button>
          </div>
        </div>
      </div>

      {/* الخلفية المظلمة */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-[2px]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
