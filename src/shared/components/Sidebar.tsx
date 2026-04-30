"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { GraduationCap, User, MoreVertical, Code, LogOut, BookOpen, List, Menu, X } from "lucide-react";

interface SidebarProps {
  session?: any;
}

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // استخراج الرتبة من السيشن القادمة من السيرفر
  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  // 1. تعريف اللينكات بالـ basePath (الكلمة الأساسية في المسار)
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
      // 🔥 تم إزالة "STUDENT" من هنا عشان يختفي عند الطالب
      role: ["ADMIN", "SUPER_ADMIN"]
    },
    { basePath: "/account", icon: User, label: "Account Settings", role: ["ADMIN", "SUPER_ADMIN", "STUDENT"] },
    { basePath: "/admin/audit-log", icon: List, label: "Audit Log", role: ["ADMIN", "SUPER_ADMIN"] },
  ];

  const visibleLinks = navLinks.filter(link => link.role.includes(userRole));

  const closeMenus = () => {
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* ─── زرار الموبايل ─── */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`md:hidden fixed top-4 left-4 z-40 p-2 rounded-[4px] shadow-md cursor-pointer ${isAdmin ? "bg-[#1E293B] text-white" : "bg-white text-[#175FFF] border border-gray-200"
          }`}
      >
        <Menu size={24} />
      </button>

      {/* ─── خلفية الموبايل الشفافة ─── */}
      {isMobileOpen && (
        <div
          onClick={closeMenus}
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm cursor-pointer"
        />
      )}

      {/* ─── السايد بار نفسه ─── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] h-screen flex flex-col shrink-0 rounded-none transition-transform duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 ${isAdmin ? "bg-[#1E293B] border-r border-[#1E293B]" : "bg-[#F4F8FF] border-r border-gray-200"
        }`}>

        <button
          onClick={closeMenus}
          className={`md:hidden absolute top-4 right-4 cursor-pointer ${isAdmin ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-800"
            }`}
        >
          <X size={20} />
        </button>

        {/* Logo Area */}
        <div className="pt-10 px-8 pb-10 flex flex-col gap-2">
          <span className={`font-black text-3xl tracking-tighter ${isAdmin ? "text-white" : "text-slate-800"}`}>
            ELEVATE
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className={`px-1 py-0.5 rounded-[2px] flex items-center justify-center ${isAdmin ? "border border-white/50 text-white" : "bg-blue-600 text-white"
              }`}>
              <Code className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className={`text-[13px] font-mono font-bold tracking-wider ${isAdmin ? "text-white" : "text-blue-600"}`}>
              Exam App
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {visibleLinks.map((link) => {
            // التوجيه الذكي: لو أدمن يضيف /admin قبل المسار (ما عدا الـ account)
            const finalHref = (isAdmin && link.basePath !== "/account" && !link.basePath.startsWith("/admin"))
              ? `/admin${link.basePath}`
              : link.basePath;

            // فحص الـ Active State
            const isActive = pathname.startsWith(link.basePath) || (pathname.startsWith("/admin") && pathname.includes(link.basePath));

            const Icon = link.icon;

            let linkClasses = "flex items-center gap-3 px-4 py-3 rounded-none w-full font-mono text-[13px] cursor-pointer transition-all duration-200 ";

            if (isActive) {
              linkClasses += isAdmin
                ? "bg-white/5 text-white border border-slate-500"
                : "bg-[#EAEFFF] text-blue-600 border border-blue-300";
            } else {
              linkClasses += isAdmin
                ? "text-slate-300 hover:text-white border border-transparent"
                : "text-slate-500 hover:text-blue-600 border border-transparent";
            }

            return (
              <Link
                key={finalHref}
                href={finalHref}
                onClick={closeMenus}
                className={linkClasses}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Dropdown */}
        {isDropdownOpen && (
          <div className={`absolute bottom-[88px] left-6 right-6 shadow-xl rounded-none z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 border ${isAdmin ? "bg-[#0F172A] border-slate-700" : "bg-white border-gray-200"
            }`}>
            <Link
              href="/account"
              className={`flex items-center gap-3 px-4 py-3 text-[13px] font-mono font-bold cursor-pointer border-b transition-colors ${isAdmin ? "text-slate-200 hover:bg-slate-800 border-slate-700/50" : "text-slate-700 hover:bg-gray-50 border-gray-100"
                }`}
              onClick={closeMenus}
            >
              <User className="w-4 h-4" /> Account
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-mono font-bold text-[#F04438] cursor-pointer transition-colors ${isAdmin ? "hover:bg-red-500/10" : "hover:bg-red-50"
                }`}
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}

        {/* User Profile Info */}
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`p-6 flex items-center gap-3 mt-auto cursor-pointer transition-colors border-t border-transparent ${isAdmin ? "hover:bg-white/5" : "hover:bg-blue-50/50"
            }`}
        >
          <img
            src={session?.user?.image || "https://github.com/shadcn.png"}
            alt="User Profile"
            className={`w-10 h-10 rounded-none object-cover border ${isAdmin ? "border-slate-600" : "border-gray-200"}`}
          />
          <div className="flex flex-col flex-1 overflow-hidden pl-1">
            <span className={`text-[13px] font-mono font-bold truncate ${isAdmin ? "text-white" : "text-blue-600"}`}>
              {session?.user?.email || "user@example.com"}
            </span>
            <span className="text-[11px] font-mono font-medium text-slate-400 truncate mt-0.5">

              {session?.user?.name || (isAdmin ? "Admin" : "Student")}
            </span>
          </div>
          <button className={`transition-colors cursor-pointer ${isAdmin ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-600"}`}>
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

      </aside>
    </>
  );
}