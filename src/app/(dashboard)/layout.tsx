"use client";

import { useState } from "react";
import { Sidebar } from "@/shared/components/Sidebar";
import { Header } from "@/shared/components/Header";
import { Toaster } from "sonner"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // حالة التحكم في فتح وإغلاق القائمة الجانبية في الموبايل
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#F4F8FF]" dir="ltr">
      
      {/* 1. الطبقة المظلمة الخلفية عند فتح المنيو في الموبايل */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* 2. القائمة الجانبية - ثابتة في مكانها */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 3. الجزء المحتوي على الهيدر والمحتوى المتغير */}
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* الشريط العلوي - ثابت فوق */}
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* المحتوى الرئيسي - هذا الجزء فقط هو الذي يعمل له سكرول */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* مكون الإشعارات */}
        <Toaster richColors position="bottom-right" />
      </div>
    </div>
  );
}