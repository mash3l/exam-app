"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowDownUp, SortDesc, SortAsc, CalendarDays } from "lucide-react";

type SortBy = "title" | "createdAt";
type SortOrder = "asc" | "desc";

type AdminSortDropdownProps = {
  sortBy: SortBy;
  sortOrder: SortOrder;
  onChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
};

export function AdminSortDropdown({ sortBy, sortOrder, onChange }: AdminSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: Array<{ sortBy: SortBy; sortOrder: SortOrder; label: string; icon: typeof SortDesc }> = [
    { sortBy: "title", sortOrder: "desc", label: "Title (descending)", icon: SortDesc },
    { sortBy: "title", sortOrder: "asc", label: "Title (ascending)", icon: SortAsc },
    { sortBy: "createdAt", sortOrder: "desc", label: "Newest (descending)", icon: CalendarDays },
    { sortBy: "createdAt", sortOrder: "asc", label: "Newest (ascending)", icon: CalendarDays },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        className="flex items-center justify-end gap-1 cursor-pointer hover:text-gray-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        Sort <ArrowDownUp size={14} />
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-[200px] bg-white border border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-[999] text-slate-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = sortBy === option.sortBy && sortOrder === option.sortOrder;
            return (
              <button
                key={`${option.sortBy}-${option.sortOrder}`}
                type="button"
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F0F5FF] transition-colors text-left border-b border-gray-100 last:border-b-0 ${
                  isActive ? "bg-[#F0F5FF]" : ""
                }`}
                onClick={() => {
                  onChange(option.sortBy, option.sortOrder);
                  setIsOpen(false);
                }}
              >
                <Icon size={16} className="text-gray-400" />
                <span className="text-[13px]">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
