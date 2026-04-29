// components/layout/Header.tsx

'use client'
import Image from 'next/image';
import { useEffect, useState } from 'react'
import Link from 'next/link';
import { formatProductImage } from "@/utils/productUtils"; 
export default function Header() {
 const [logoUrl, setLogoUrl] = useState('/logo.webp'); 

// 2. استخدم useEffect لتحديث الرابط بعد تحميل الصفحة فقط
useEffect(() => {
  setLogoUrl(formatProductImage(`/logo.webp?t=${Date.now()}`));
}, []);
 
 
  


  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
       <Link href="/" className="flex items-center gap-2">
  <Image
    src={logoUrl}
    alt="Logo"
    width={40}  // العرض المطلوب (أو 32 ليكون أصغر)
    height={40} // الطول المطلوب
    className="object-contain w-10 h-10" // حجم صغير ثابت
    priority={true} // لتحميل الشعار فوراً
  />
</Link>
        

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
           <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">الرئيسية</Link>
           <Link href="/products" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">المنتجات</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
           
        </div>
      </div>
    </header>
  );
}
