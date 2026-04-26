// components/layout/Header.tsx
import Link from 'next/link';

export default function Header({ logo }: { logo: string }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
           {logo ? <img src={logo} alt="Logo" className="h-10 w-auto object-contain" /> : <span className="font-bold text-xl">متجرنا</span>}
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
