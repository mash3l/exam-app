"use client";

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  
  // تحديد اسم الصفحة بناءً على المسار
  const pageName = pathname.includes("account") ? "Account Settings" : "Diplomas";

  return (
    // شيلنا البوردر والظل والأيقونة اللي على اليمين عشان تطابق الصورة
    <header className="h-14 bg-white flex items-end px-10 pb-2 shrink-0">
      <span className="text-[13px] font-medium text-gray-400 tracking-wide">
        {pageName}
      </span>
    </header>
  );
}
