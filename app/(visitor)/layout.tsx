import { SUPABASE_STORAGE_URL } from "@/components/constants/index"; // استيراد الرابط
import { ClientProviders } from "./ClientProviders";
import React from 'react'
import "@/app/globals.css";
import { getSiteSettings } from '@/app/actions/settings';
import Header from '@/components/layout/Header'; 
import Footer from '@/components/layout/Footer'; 

export default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  
  // بناء الرابط الثابت
  

  return (
    <ClientProviders>
      {/* تمرير الرابط الموحد للـ Header */}
      <Header /> 
      {children}
      <Footer 
        text={settings?.footer_text || "جميع الحقوق محفوظة"}
        links={settings?.footer_links}
      />
    </ClientProviders>
  );
}
