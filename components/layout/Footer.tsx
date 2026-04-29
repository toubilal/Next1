// components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer({ text, links }: { text: string, links: any[] }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-gray-50 border-t pt-12 pb-6">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-10 text-center md:text-right">
        
        {/* وصف المتجر */}
        <div>
          <h3 className="font-bold text-lg mb-3">✨ عن المتجر</h3>
          <p className="text-gray-500 text-sm leading-6">{text}</p>
        </div>

        {/* الروابط (ديناميكية) */}
        <div>
          <h3 className="font-bold text-lg mb-3">🔗 روابط هامة</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            {links?.map((link, i) => (
              <li key={i} className="hover:text-blue-600 transition">
                <Link href={link.url}>{link.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* طرق الدفع والشحن (إضافة احترافية) */}
        <div>
          <h3 className="font-bold text-lg mb-3">💳 طرق الدفع</h3>
          <div className="flex justify-center md:justify-end gap-4 opacity-70">
            {/* يمكنك استبدال هذه بـ Image مكونات */}
            <span>💳 الدفع عند الاستلام</span>
            
          </div>
        </div>
      </div>

      {/* شريط الحقوق (الذي سألت عنه) */}
      <div className="border-t mt-10 pt-6 text-center text-gray-400 text-xs">
        <p>© {currentYear} اسم متجرك. جميع الحقوق محفوظة.</p>
        <p className="mt-2">صنع بـ ❤️ في الجزائر</p>
      </div>
    </footer>
  )
}
