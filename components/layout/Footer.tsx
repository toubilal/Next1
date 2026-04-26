// components/layout/Footer.tsx

export default function Footer({ text }: { text: string }) {
  return (
    <footer className="mt-16 bg-gradient-to-b from-gray-50 to-white border-t">

      <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-10 text-center md:text-right">

        {/* About */}
        <div>
          <h3 className="font-bold text-lg mb-3">✨ عن المتجر</h3>
          <p className="text-gray-500 text-sm leading-6">{text}</p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-bold text-lg mb-3">🔗 روابط</h3>
          <ul className="space-y-2 text-gray-500 text-sm">
            <li className="hover:text-black cursor-pointer">سياسة الخصوصية</li>
            <li className="hover:text-black cursor-pointer">الشروط والأحكام</li>
            <li className="hover:text-black cursor-pointer">اتصل بنا</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-lg mb-3">📩 تواصل معنا</h3>
          <p className="text-gray-500 text-sm">info@store.com</p>

          {/* Social */}
          <div className="flex justify-center md:justify-end gap-3 mt-4 text-xl">
            <span className="hover:scale-110 transition cursor-pointer">📘</span>
            <span className="hover:scale-110 transition cursor-pointer">📸</span>
            <span className="hover:scale-110 transition cursor-pointer">🐦</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-4 text-center text-xs text-gray-400">
        © 2026 جميع الحقوق محفوظة — صنع بـ ❤️
      </div>
    </footer>
  )
}