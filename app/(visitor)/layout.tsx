import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from 'react'
import "@/app/globals.css";
import { ClientProviders } from "./ClientProviders";

import { getSiteSettings } from '@/app/actions/settings';
import Header from '@/components/layout/Header'; 
import Footer from '@/components/layout/Footer'; 
// احذف الـ Fonts من هنا إذا كانت موجودة في الـ Root Layout الرئيسي
// اترك الـ Metadata إذا كنت تريدها مخصصة لصفحات الزوار فقط

export  default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  return (
    // احذف <html> و <body> من هنا
    <ClientProviders>
      <Header logo={settings.logo_url} />
      {children}
      <Footer text={settings.footer_text} />
    </ClientProviders>
  );
}
