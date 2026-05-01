"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GraduationCap, User, MoreVertical, LogOut, BookOpen, List, X } from "lucide-react";
import type { AppSession } from "@/types/auth";

// الخصائص الممررة من الـ Layout للتحكم في الحالة من الخارج
interface SidebarProps {
  session?: AppSession | null;
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ session, isMobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // استخراج الرتبة (Role) لضبط الثيم والأذونات
  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  const navLinks = [
    {
      basePath: "/diplomas",
      icon: GraduationCap,
      label: "Diplomas",
      role: ["ADMIN", "SUPER_ADMIN", "STUDENT"]
    },
    {
      basePath: "/exams",
      icon: BookOpen,
      label: "Exams",
      role: ["ADMIN", "SUPER_ADMIN"]
    },
    { basePath: "/account", icon: User, label: "Account Settings", role: ["ADMIN", "SUPER_ADMIN", "STUDENT"] },
    { basePath: "/admin/audit-log", icon: List, label: "Audit Log", role: ["ADMIN", "SUPER_ADMIN"] },
  ];

  const visibleLinks = navLinks.filter(link => link.role.includes(userRole));

  const closeMenus = () => {
    setIsDropdownOpen(false);
    onClose(); // تنفيذ دالة الإغلاق الممررة من الـ Layout
  };

  return (
    <>
      {/* ─── Mobile Overlay ─── */}
      {isMobileOpen && (
        <div
          onClick={closeMenus}
          className="lg:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm cursor-pointer"
        />
      )}

      {/* ─── Sidebar Component ─── */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[300px] sm:w-[362px] min-w-[300px] sm:min-w-[362px] shrink-0 flex-col rounded-none transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          // ضبط الألوان بناءً على نوع المستخدم
          isAdmin ? "bg-[#1F2937] border-r border-slate-700" : "bg-[#F4F7FE] border-r border-blue-50/50"
        }`}
      >
        {/* زر إغلاق القائمة في الموبايل */}
        <button
          onClick={closeMenus}
          className={`lg:hidden absolute top-4 right-4 cursor-pointer transition-colors p-2 ${
            isAdmin ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-800"
          }`}
        >
          <X size={24} />
        </button>

        {/* Logo Area */}
        <div className="pt-12 px-8 flex flex-col gap-1.5">
          <span className={`font-black text-[34px] tracking-tight cursor-default ${isAdmin ? "text-white" : "text-[#404040]"}`}>
            ELEVATE
          </span>
          <div className="flex items-center gap-2">
            <div
              className={`px-1.5 py-0.5 rounded-[4px] flex items-center justify-center text-[10px] font-bold ${
                isAdmin ? "border border-white/50 text-white" : "bg-[#2563EB] text-white"
              }`}
            >
              &lt;&gt;
            </div>
            <span
              className={`text-[15px] font-mono font-bold tracking-wide cursor-default ${
                isAdmin ? "text-white" : "text-[#2563EB]"
              }`}
            >
              Exam App
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-6 space-y-2 mt-12 overflow-y-auto custom-scrollbar">
          {visibleLinks.map((link) => {
            const finalHref =
              isAdmin && link.basePath !== "/account" && !link.basePath.startsWith("/admin")
                ? `/admin${link.basePath}`
                : link.basePath;

            const isActive =
              pathname.startsWith(link.basePath) ||
              (pathname.startsWith("/admin") && pathname.includes(link.basePath));

            const Icon = link.icon;

            return (
              <Link 
                key={finalHref} 
                href={finalHref} 
                onClick={onClose} // إغلاق القائمة عند الضغط في الموبايل
                className={`flex items-center gap-3 px-4 py-3.5 rounded-[2px] w-full font-mono text-[14px] cursor-pointer transition-all duration-200 border ${
                  isActive 
                    ? (isAdmin ? "bg-white/5 text-white border-slate-500" : "bg-[#E4EDFE] text-[#2563EB] border-[#93C5FD]") 
                    : (isAdmin ? "text-slate-300 border-transparent hover:text-white hover:bg-white/5" : "text-[#71717A] border-transparent hover:text-[#2563EB] hover:bg-[#E4EDFE]/50")
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Dropdown Area */}
        <div className="relative mt-auto">
          {isDropdownOpen && (
            <div
              className={`absolute bottom-[90px] left-8 right-8 shadow-xl rounded-[4px] z-[80] animate-in fade-in slide-in-from-bottom-2 duration-200 border ${
                isAdmin ? "bg-[#0F172A] border-slate-700" : "bg-white border-[#E5E7EB]"
              }`}
            >
              <Link
                href="/account"
                className={`flex items-center gap-3 px-4 py-3.5 text-[14px] font-mono font-medium cursor-pointer border-b transition-colors ${
                  isAdmin ? "text-slate-200 hover:bg-slate-800 border-slate-700/50" : "text-[#404040] hover:bg-[#F9FAFB] border-[#F3F4F6]"
                }`}
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="w-4 h-4" /> Account Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-[14px] font-mono font-medium text-[#DC2626] cursor-pointer transition-colors ${
                  isAdmin ? "hover:bg-red-500/10" : "hover:bg-red-50"
                }`}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}

          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`px-8 py-6 flex items-center gap-3 cursor-pointer transition-colors ${
              isAdmin ? "hover:bg-white/5" : "hover:bg-[#E4EDFE]/50"
            }`}
          >
            <img
              src={session?.user?.image || "https://github.com/shadcn.png"}
              alt="User Profile"
              className={`w-[42px] h-[42px] rounded-[2px] object-cover border ${
                isAdmin ? "border-slate-600" : "border-[#93C5FD] bg-white"
              }`}
            />
            <div className="flex flex-col flex-1 overflow-hidden pl-1 gap-0.5">
              <span className={`text-[15px] font-mono font-bold truncate ${isAdmin ? "text-white" : "text-[#2563EB]"}`}>
                {session?.user?.name || "User"}
              </span>
              <span className={`text-[12px] font-mono truncate ${isAdmin ? "text-slate-400" : "text-[#71717A]"}`}>
                {session?.user?.email || "email@example.com"}
              </span>
            </div>
            <MoreVertical className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
          </div>
        </div>
      </aside>
    </>
  );
}