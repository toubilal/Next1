// components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer({ text, links }: { text: string, links: any[] }) {
  const currentYear = new Date().getFullYear();

  return (
  <footer className="mt-16 bg-surface-2 border-t border-border pt-12 pb-6">
    <div 
      id="as"
      className="container mx-auto px-4 grid md:grid-cols-3 gap-10 text-start"
    >
      
      {/* وصف المتجر */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-text">✨ عن المتجر</h3>
        <p className="text-muted text-sm leading-6">{text}</p>
      </div>

      {/* الروابط (ديناميكية) */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-text">🔗 روابط هامة</h3>
        <ul className="space-y-2 text-muted text-sm">
          {links?.map((link, i) => (
            <li key={i} className="hover:text-primary transition">
              <Link href={link.url}>{link.title}</Link>
            </li>
          ))}
        </ul>
      </div>

      {/* طرق الدفع والشحن */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-text">💳 طرق الدفع</h3>
        <div className="flex justify-start gap-4 opacity-70 text-sm text-muted">
          <span>💳 الدفع عند الاستلام</span>
        </div>
      </div>
    </div>

    {/* شريط الحقوق */}
    <div className="border-t border-border mt-10 pt-6 text-center text-muted text-xs">
      <p>© {currentYear} اسم متجرك. جميع الحقوق محفوظة.</p>
      <p className="mt-2 text-sm">صنع بـ ❤️ في الجزائر</p>
    </div>
  </footer>
)
}
