// app/layout.tsx
import React from "react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-surface-2  text-slate-900">
        {children}
      </body>
    </html>
  );
}