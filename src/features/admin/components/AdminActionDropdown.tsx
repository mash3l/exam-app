"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. استيراد الراوتر
import { MoreHorizontal, Eye, Edit2, Trash2 } from "lucide-react";

interface AdminActionDropdownProps {
  id: string;
  basePath?: string; 
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AdminActionDropdown({ id, basePath = "/admin/diplomas", onEdit, onDelete }: AdminActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); // 2. تعريف الراوتر

  // 3. دالة تقفل الدروب داون لو ضغطت في أي مكان فاضي في الشاشة (ممتازة للـ UX)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* زرار فتح القائمة */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // 🔴 منع الضغطة من التسريب للصف
          setIsOpen(!isOpen);
        }}
        className="w-8 h-8 inline-flex items-center justify-center bg-[#F1F5F9] text-gray-500 hover:bg-gray-200 transition-colors rounded-[4px] cursor-pointer"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-8 top-0 z-50 w-[120px] bg-white border border-gray-200 shadow-md py-1 animate-in fade-in zoom-in-95 duration-100 rounded-[4px]">
          
          {/* زرار الـ View */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              router.push(`${basePath}/${id}`);
            }}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 text-[#10B981] text-[13px] font-bold transition-colors cursor-pointer"
          >
            <Eye size={14} strokeWidth={2.5} /> View
          </button>
          
          {/* زرار الـ Edit */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              if (onEdit) {
                onEdit(); // لو باعت دالة من بره استخدمها
              } else {
                router.push(`${basePath}/${id}/edit`); // لو مش باعت، وديه لصفحة التعديل فوراً
              }
            }} 
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 text-[#175FFF] text-[13px] font-bold transition-colors cursor-pointer"
          >
            <Edit2 size={14} strokeWidth={2.5} /> Edit
          </button>
          
          {/* زرار الـ Delete */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              if (onDelete) {
                onDelete();
              } else {
                // هنا ممكن تحط الـ Toast اللي بيظهر رسالة الحذف لو مفيش onDelete مبعوتة
                console.log("Delete clicked for ID:", id);
              }
            }} 
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-red-50 text-[#F04438] text-[13px] font-bold transition-colors border-t border-gray-50 cursor-pointer"
          >
            <Trash2 size={14} strokeWidth={2.5} /> Delete
          </button>

        </div>
      )}
    </div>
  );
}