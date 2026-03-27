import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ClientProviders } from "./ClientProviders";

// احذف الـ Fonts من هنا إذا كانت موجودة في الـ Root Layout الرئيسي
// اترك الـ Metadata إذا كنت تريدها مخصصة لصفحات الزوار فقط

export default function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // احذف <html> و <body> من هنا
    <ClientProviders>
      {children}
    </ClientProviders>
  );
}
