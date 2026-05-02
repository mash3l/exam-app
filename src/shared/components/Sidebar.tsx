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
  X
} from "lucide-react";
import type { AppSession } from "@/types/auth";

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
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

  // 1. تحديد الرتبة الأساسية
  const userRole = typedSession?.user?.role || "STUDENT";
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  // 2. استخراج اسم اليوزر بذكاء (لو مفيش اسم، هناخد اللي قبل الـ @ من الإيميل)
  const userEmail = typedSession?.user?.email || "user@example.com";
  const usernameFromEmail = userEmail.split("@")[0]; // بيجيب مثلا mash319
  
  // الاسم النهائي اللي هيتعرض (الاسم الحقيقي لو موجود، أو الـ Username من الإيميل)
  const displayName = typedSession?.user?.name || usernameFromEmail;

  // 3. تنسيق الرتبة عشان تظهر بشكل احترافي (مثال: SUPER_ADMIN -> Super Admin)
  const displayRole = userRole
    .replace('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const userImage = typedSession?.user?.image || "https://github.com/shadcn.png";

  const navLinks = [
    { basePath: "/diplomas", icon: GraduationCap, label: "Diplomas", roles: ["ADMIN", "SUPER_ADMIN", "STUDENT"] },
    { basePath: "/exams", icon: BookOpen, label: "Exams", roles: ["ADMIN", "SUPER_ADMIN"] },
    { basePath: "/account", icon: UserIcon, label: "Account Settings", roles: ["ADMIN", "SUPER_ADMIN", "STUDENT"] },
    { basePath: "/admin/audit-log", icon: ClipboardList, label: "Audit Log", roles: ["ADMIN", "SUPER_ADMIN"] },
  ];

  const visibleLinks = navLinks.filter(link => link.roles.includes(userRole));

  const closeMenus = () => {
    setIsProfileOpen(false);
    onClose();
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
        className={`fixed inset-y-0 left-0 z-[70] flex w-[300px] sm:w-[362px] shrink-0 flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isAdmin ? "bg-[#1E293B] text-slate-300 border-r border-slate-800" : "bg-[#EFF6FF] text-[#404040] border-r border-blue-50/50"
        }`}
      >
        <button
          onClick={closeMenus}
          className={`lg:hidden absolute top-4 right-4 p-2 transition-colors ${
            isAdmin ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-800"
          }`}
        >
          <X size={24} />
        </button>

        {/* Logo Area */}
        <div className={`px-10 pt-12 pb-8 flex flex-col gap-1.5`}>
          <h1 className={`text-[34px] font-black tracking-tight cursor-default ${isAdmin ? "text-white" : "text-[#404040]"}`}>
            ELEVATE
          </h1>
          <div className={`flex items-center gap-2 font-mono text-[15px] font-bold tracking-wide ${isAdmin ? "text-white" : "text-[#2563EB]"}`}>
            <span className={`px-1.5 py-0.5 rounded-[4px] flex items-center justify-center text-[10px] font-bold ${isAdmin ? "border border-white/50 text-white" : "bg-[#2563EB] text-white"}`}>
              &lt;&gt;
            </span>
            Exam App
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-10 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {visibleLinks.map((link) => {
            const finalHref = isAdmin && link.basePath !== "/account" && !link.basePath.startsWith("/admin")
              ? `/admin${link.basePath}`
              : link.basePath;

            const isActive = pathname.startsWith(finalHref);
            const Icon = link.icon;

            return (
              <Link
                key={finalHref}
                href={finalHref}
                onClick={closeMenus}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-[2px] w-full font-mono text-[14px] transition-all duration-200 border ${
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
        <div className={`relative px-10 py-8 mt-auto`} ref={profileRef}>
          {isProfileOpen && (
            <div className={`absolute bottom-[80px] left-10 right-10 shadow-xl rounded-[4px] z-[80] animate-in fade-in duration-200 border ${
              isAdmin ? "bg-[#0F172A] border-slate-700 text-slate-300" : "bg-white border-[#E5E7EB] text-[#404040]"
            }`}>
              <Link 
                href="/account" 
                onClick={() => setIsProfileOpen(false)} 
                className={`w-full px-4 py-3.5 flex items-center gap-3 text-[14px] font-mono font-medium border-b transition-colors ${isAdmin ? "hover:bg-slate-800 border-slate-700/50" : "hover:bg-[#F9FAFB] border-[#F3F4F6]"}`}
              >
                <UserIcon className="w-4 h-4" /> Account Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className={`w-full px-4 py-3.5 flex items-center gap-3 text-[14px] font-mono font-medium text-[#DC2626] transition-colors text-left cursor-pointer ${isAdmin ? "hover:bg-red-500/10" : "hover:bg-red-50"}`}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}

          <div
            className={`flex items-center justify-between cursor-pointer p-3 rounded-md transition-colors -mx-3 ${
              isAdmin ? "hover:bg-slate-800" : "hover:bg-[#E4EDFE]/50"
            }`}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <img src={userImage} alt="User Profile" className={`w-[42px] h-[42px] object-cover rounded-[2px] border ${isAdmin ? "border-slate-600" : "border-[#93C5FD] bg-white"}`} />
              <div className="flex flex-col overflow-hidden pl-1 gap-0.5">
                {/* هنا اسم اليوزر أو الـ Username هيظهر فوق، وتحته الرتبة */}
                <span className={`text-[15px] font-mono font-bold truncate ${isAdmin ? "text-white" : "text-[#2563EB]"}`}>
                  {displayName}
                </span>
                <span className={`text-[12px] font-mono truncate w-[130px] ${isAdmin ? "text-slate-400" : "text-[#71717A]"}`}>
                  {displayRole}
                </span>
              </div>
            </div>
            <MoreVertical size={20} className={isAdmin ? "text-slate-400" : "text-slate-400"} strokeWidth={1.5} />
          </div>
        </div>
      </aside>
    </>
  );
}