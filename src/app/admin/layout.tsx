"use client";

import { useState } from "react";
import { Sidebar } from "@/shared/components/Sidebar";
import { Header } from "@/shared/components/Header";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#ffffff]" dir="ltr">
      
      {/* الـ Sidebar هنا لازم ياخد الـ props اللي هو مستنيها عشان الـ Build ينجح */}
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />

      <div className="relative flex flex-1 flex-col">
        {/* مررنا الدالة هنا لفتح المنيو في الموبايل */}
        <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>

        <Toaster richColors position="bottom-right" />
      </div>
    </div>
  );
}