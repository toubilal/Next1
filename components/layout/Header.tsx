'use client'
import Image from 'next/image';
import { useEffect, useState } from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { formatProductImage } from "@/utils/productUtils"; 

export default function Header() {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState('/logo.webp'); 
  const [tagline, setTagline] = useState('نمثل الأصالة والإبداع');
  const [storeName, setStoreName] = useState('اسم المتجر');

  useEffect(() => {
    setLogoUrl(formatProductImage(`/logo.webp?t=${Date.now()}`));
  }, []);

  const isHomePage = pathname === '/';
  
  return (
  <header className="w-full backdrop-blur-md">
    <div className="w-full px-4 py-3 flex flex-col gap-3">

      {/* Row 1 */}
      <div className="w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logoUrl}
            alt="Logo"
            width={40}
            height={40}
            className="object-contain w-10 h-10"
            priority
          />
        </Link>
        <span className="font-bold text-lg text-text text-start">
          {storeName}
        </span>
      </div>

      {/* Home Page Content */}
      {isHomePage && (
        <>
          {/* Row 2 */}
          <span className="text-sm text-muted text-start w-full">
            {tagline}
          </span>

          {/* Row 3 */}
          <div className="w-full flex justify-start gap-2">
            <a
              href="#products-part"
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition"
            >
              تصفح المنتجات
            </a>
            <a
              href="#as"
              className="px-3 py-1.5 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/10 transition"
            >
              تعرف علينا
            </a>
          </div>
        </>
      )}

    </div>
  </header>
);
}
