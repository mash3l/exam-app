"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react"; // تأكد من تثبيت lucide-react أو استبدلها بـ SVG

// تعريف الـ Interface لضمان توافق الـ TypeScript مع الـ Layout
interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  // دالة لتحديد العنوان بناءً على المسار الحالي (لتحسين الـ UX)
  const getPageTitle = () => {
    if (pathname.includes("/diplomas")) return "Diplomas";
    if (pathname.includes("/exams")) return "Exams";
    if (pathname.includes("/audit-log")) return "Audit Log";
    if (pathname.includes("/account")) return "Account Settings";
    return "Dashboard";
  };

  return (
    <header className="w-full bg-white border-b border-gray-100 px-4 sm:px-8 py-5 flex items-center sticky top-0 z-20 min-h-[64px]">
      
      {/* زر المنيو - يظهر فقط في الشاشات الصغيرة (Mobile/Tablet) */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onMenuClick(); // استدعاء الدالة الممرة من الـ Layout
        }}
        className="lg:hidden mr-4 p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        aria-label="Open Menu"
      >
        <Menu size={24} />
      </button>

      {/* نص العنوان: استايل Figma (Uppercase + Mono Font) */}
      <span className="text-[12px] font-bold text-slate-400 font-mono tracking-widest uppercase">
        {getPageTitle()}
      </span>
    </header>
  );
}