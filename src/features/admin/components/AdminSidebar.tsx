"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { 
  GraduationCap, 
  BookOpen, 
  User as UserIcon, 
  ClipboardList, 
  MoreVertical,
  LogOut,
  AppWindow
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin/diplomas", icon: GraduationCap, label: "Diplomas" },
  { href: "/admin/exams", icon: BookOpen, label: "Exams" },
  { href: "/account/profile", icon: UserIcon, label: "Account Settings" },
  { href: "/admin/audit-log", icon: ClipboardList, label: "Audit Log" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName = (session?.user as any)?.firstName || session?.user?.name || "Firstname";
  const userEmail = session?.user?.email || "user-email@example.com";
  const userImage = session?.user?.image || "https://github.com/shadcn.png"; 

  return (
    // اللون هنا هو الكحلي الغامق جداً بتاع فيجما والمقاس أصغر
    <aside className="w-[250px] min-w-[280px] h-screen sticky top-0 flex flex-col bg-[#1E293B] text-slate-300 z-50">
      
      {/* 1. منطقة اللوجو */}
      <div className="p-7 pb-8 border-b border-white/5">
        <h1 className="text-white text-[22px] font-black tracking-wide mb-1">ELEVATE</h1>
        <div className="flex items-center gap-2 text-white/90 font-mono text-[12px] font-medium">
          {/* أيقونة < > بتاعة فيجما */}
          <span className="border border-white/40 rounded-[3px] px-1 text-[9px] tracking-tighter">&lt; &gt;</span> 
          Exam App
        </div>
      </div>

      {/* 2. الروابط */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {ADMIN_LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium transition-colors ${
                isActive 
                  ? "text-white bg-[#334155]" // لون الـ Active الهادي بتاع فيجما
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. منطقة البروفايل تحت خالص */}
      <div className="relative p-4 border-t border-white/5" ref={profileRef}>
        {isProfileOpen && (
          <div className="absolute bottom-[100%] left-4 mb-2 w-[210px] bg-white border border-gray-200 shadow-lg animate-in fade-in zoom-in-95 duration-100 text-slate-700 text-[12px] rounded-sm">
            <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left font-medium">
              <UserIcon size={14} className="text-gray-400" /> Account
            </button>
            <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left font-medium">
              <AppWindow size={14} className="text-gray-400" /> Application
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 text-[#F04438] transition-colors text-left font-medium"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        )}

        <div 
          className="flex items-center justify-between cursor-pointer hover:bg-slate-800 p-2 rounded-md transition-colors -mx-2" 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={userImage} alt="User" className="w-8 h-8 object-cover rounded-sm" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-white text-[12px] font-bold truncate">{userName}</span>
              <span className="text-slate-400 text-[11px] truncate w-[120px]">{userEmail}</span>
            </div>
          </div>
          <MoreVertical size={16} className="text-slate-400" />
        </div>
      </div>
      
    </aside>
  );
}