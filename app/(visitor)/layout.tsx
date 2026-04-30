// VisitorLayout.tsx
import { SUPABASE_STORAGE_URL } from "@/components/constants/index"; 
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

  return (
    <ClientProviders>
      <div dir="rtl" className="min-h-screen flex flex-col bg-surface-2  text-foreground">
        <Header /> 

        <main className="flex-grow">
          {children}
        </main>

        <Footer 
          text={settings?.footer_text || "جميع الحقوق محفوظة"}
          links={settings?.footer_links}
        />
      </div>
    </ClientProviders>
  );
}