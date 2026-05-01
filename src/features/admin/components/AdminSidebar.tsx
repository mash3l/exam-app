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
import type { AppSession } from "@/types/auth";

// شيلنا الـ href الحقيقي من هنا عشان ميكونش ليه أي تأثير
const ADMIN_LINKS = [
  { href: "/admin/diplomas", icon: GraduationCap, label: "Diplomas" },
  { href: "/admin/exams", icon: BookOpen, label: "Exams" },
  { href: "#", icon: UserIcon, label: "Account Settings", isDead: true }, 
  { href: "/admin/audit-log", icon: ClipboardList, label: "Audit Log" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const typedSession = session as AppSession | null;
  
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

  const userName = typedSession?.user?.name || "Firstname";
  const userEmail = typedSession?.user?.email || "user-email@example.com";
  const userImage = typedSession?.user?.image || "https://github.com/shadcn.png";

  return (
    <aside className="w-[250px] h-screen sticky left-0 min-w-[280px] h-screen sticky top-0 flex flex-col bg-[#1E293B] text-slate-300 z-50">
      
      {/* 1. منطقة اللوجو */}
      <div className="p-7 pb-8 border-b border-white/5">
        <h1 className="text-white text-[22px] font-black tracking-wide mb-1">ELEVATE</h1>
        <div className="flex items-center gap-2 text-white/90 font-mono text-[12px] font-medium">
          <span className="border border-white/40 rounded-[3px] px-1 text-[9px] tracking-tighter">&lt; &gt;</span> 
          Exam App
        </div>
      </div>

      {/* 2. الروابط */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {ADMIN_LINKS.map((link) => {
          const isActive = !link.isDead && pathname.startsWith(link.href);
          const Icon = link.icon;

          //   خيال المآتة (لا بيتداس ولا بيعمل هوفر ولا ليه لينك)  
          if (link.isDead) {
            return (
              <div
                key={link.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium text-slate-500 opacity-40 pointer-events-none select-none"
              >
                <Icon size={18} strokeWidth={2} />
                {link.label}
              </div>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-[13px] font-medium transition-colors ${
                isActive 
                  ? "text-white bg-[#334155]" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. منطقة البروفايل */}
      <div className="relative p-4 border-t border-white/5" ref={profileRef}>
        {isProfileOpen && (
          <div className="absolute bottom-[100%] left-4 mb-2 w-[210px] bg-white border border-gray-200 shadow-lg animate-in fade-in zoom-in-95 duration-100 text-slate-700 text-[12px] rounded-sm">
            
            {/* خيال مآتة لزراير البروفايل برضه */}
            <div className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-300 font-medium pointer-events-none select-none">
              <UserIcon size={14} className="text-gray-300" /> Account
            </div>
            <div className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-300 font-medium pointer-events-none select-none">
              <AppWindow size={14} className="text-gray-300" /> Application
            </div>
            
            <div className="border-t border-gray-100 my-1"></div>
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 text-[#F04438] transition-colors text-left font-medium cursor-pointer"
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