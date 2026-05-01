"use client";

import { usePathname } from "next/navigation";

export function AdminHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes("/admin/diplomas")) return "Diplomas";
    if (pathname.includes("/admin/exams")) return "Exams";
    if (pathname.includes("/admin/audit-log")) return "Audit Log";
    if (pathname.includes("/admin/account")) return "Account Settings";
    return "Dashboard"; 
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 px-8 py-5 flex items-center sticky top-0 z-20">
      <span className="text-[13px] font-bold text-slate-400 font-mono tracking-wide">
        {getPageTitle()}
      </span>
    </div>
  );
}