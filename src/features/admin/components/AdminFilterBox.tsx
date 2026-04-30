"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";

interface AdminFilterBoxProps {
  children: React.ReactNode;
}

export function AdminFilterBox({ children }: AdminFilterBoxProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-200 shadow-sm mb-6 relative z-20">
      <div 
        className="bg-[#175FFF] text-white px-4 py-3 flex justify-between items-center cursor-pointer transition-colors hover:bg-blue-700" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 font-mono text-[13px] font-bold">
          <Filter size={16} /> Search & Filters
        </div>
        <button className="flex items-center gap-1 font-mono text-[12px] opacity-90 hover:opacity-100">
          <X size={14} /> {isOpen ? "Hide" : "Show"}
        </button>
      </div>

      {isOpen && (
        <div className="p-5">
          {children}
        </div>
      )}
    </div>
  );
}