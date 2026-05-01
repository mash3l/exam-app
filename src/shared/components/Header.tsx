"use client";

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  // دالة لتحديد العنوان بناءً على المسار الحالي
  const getPageTitle = () => {
    if (pathname.includes("/diplomas")) return "Diplomas";
    if (pathname.includes("/exams")) return "Exams";
    if (pathname.includes("/audit-log")) return "Audit Log";
    if (pathname.includes("/account")) return "Account Settings";
    return "Dashboard";
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 px-8 py-5 flex items-center sticky top-0 z-20 min-h-[64px]">
      {/* نص العنوان بنفس استايل الـ Figma: رمادي فاتح، خط مونو، وحروف كبيرة */}
      <span className="text-[12px] font-bold text-slate-400 font-mono tracking-widest uppercase">
        {getPageTitle()}
      </span>
    </header>
  );
}