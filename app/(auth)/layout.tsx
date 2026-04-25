import React from "react";
import type { Metadata } from "next";
import "@/app/globals.css";
// يمكنك ترك الميتاداتا هنا، ستعمل بشكل صحيح
export const metadata: Metadata = {
  title: "تسجيل دخول المدير",
  description: "لوحة تحكم إدارة المتجر",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // هنا نستخدم div فقط ليحتوي الصفحة، بدون html أو body
    <div className="bg-slate-100 min-h-screen flex items-center justify-center">
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
