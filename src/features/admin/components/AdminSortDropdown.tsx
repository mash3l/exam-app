"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowDownUp, SortDesc, SortAsc, CalendarDays } from "lucide-react";

export function AdminSortDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // عشان نقفل المنيو لو دسنا بره
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
      <div 
        className="flex items-center justify-end gap-1 cursor-pointer hover:text-gray-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        Sort <ArrowDownUp size={14} />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-[160px] bg-white border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-[999] text-slate-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right">          <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F0F5FF] transition-colors text-left border-b border-gray-100">
            <SortDesc size={16} className="text-gray-400" />
            <span className="text-[13px]"><strong className="font-bold">Title</strong> <span className="text-gray-400 text-[11px]">(descending)</span></span>
          </button>
          <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F0F5FF] transition-colors text-left border-b border-gray-100">
            <SortAsc size={16} className="text-gray-400" />
            <span className="text-[13px]"><strong className="font-bold">Title</strong> <span className="text-gray-400 text-[11px]">(ascending)</span></span>
          </button>
          <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F0F5FF] transition-colors text-left border-b border-gray-100">
            <CalendarDays size={16} className="text-gray-400" />
            <span className="text-[13px]"><strong className="font-bold">Newest</strong> <span className="text-gray-400 text-[11px]">(descending)</span></span>
          </button>
          <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F0F5FF] transition-colors text-left">
            <CalendarDays size={16} className="text-gray-400" />
            <span className="text-[13px]"><strong className="font-bold">Newest</strong> <span className="text-gray-400 text-[11px]">(ascending)</span></span>
          </button>
        </div>
      )}
    </div>
  );
}