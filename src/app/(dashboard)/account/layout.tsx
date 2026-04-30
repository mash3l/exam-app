"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, User, Lock, LogOut } from "lucide-react";
// 1. استيراد دالة signOut
import { signOut } from "next-auth/react"; 

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = pathname.includes("password") ? "password" : "profile";

  return (
    <div className="w-full h-full flex flex-col animate-in fade-in duration-500 relative">
      <nav className="text-[13px] font-mono text-gray-400 mb-6">Account</nav>

      {/* Header */}
      <div className="flex gap-4 mb-8 h-[64px]">
        <Link href="/diplomas" className="w-[64px] h-full bg-white border border-gray-200 flex items-center justify-center text-blue-600 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
          <ChevronLeft size={26} strokeWidth={2} />
        </Link>
        <div className="flex-1 h-full bg-[#175FFF] text-white px-8 flex items-center gap-4 shadow-sm">
          <User size={28} strokeWidth={2} />
          <h1 className="text-[26px] font-bold font-mono tracking-wide">Account Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-8 flex-1 pb-10">
        
        {/* Sidebar */}
        <div className="w-[280px] flex flex-col shrink-0 min-h-[500px] bg-white border border-gray-200 shadow-sm p-4">
          <div className="space-y-2">
            <Link 
              href="/account/profile"
              className={`w-full flex items-center gap-4 px-6 py-4 text-[14px] font-bold font-mono cursor-pointer transition-colors rounded-none ${
                activeTab === "profile" ? "bg-[#F0F5FF] text-[#175FFF]" : "text-slate-500 hover:bg-white"
              }`}
            >
              <User size={20} strokeWidth={activeTab === "profile" ? 2.5 : 2} /> Profile
            </Link>
            
            <Link 
              href="/account/password"
              className={`w-full flex items-center gap-4 px-6 py-4 text-[14px] font-bold font-mono cursor-pointer transition-colors rounded-none ${
                activeTab === "password" ? "bg-[#F0F5FF] text-[#175FFF]" : "text-slate-500 hover:bg-white"
              }`}
            >
              <Lock size={20} strokeWidth={activeTab === "password" ? 2.5 : 2} /> Change Password
            </Link>
          </div>

          {/* 2. تفعيل زرار الـ Logout */}
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} // هيمسح السيشن ويوديه للوجين
            className="w-full flex items-center gap-4 px-6 py-4 text-[14px] font-bold font-mono text-[#F04438] bg-[#FEF3F2] hover:bg-red-50 cursor-pointer transition-colors rounded-none mt-auto"
          >
            <LogOut size={20} strokeWidth={2} /> Logout
          </button>
        </div>

        {/* المربع الأبيض اللي بيتغير جواه المحتوى */}
        <div className="flex-1 bg-white border border-gray-200 shadow-sm p-8">
          {children}
        </div>
        
      </div>
    </div>
  );
}