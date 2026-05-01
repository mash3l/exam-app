"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminTopBarProps {
  children?: React.ReactNode;
}

export function AdminTopBar({ children }: AdminTopBarProps) {
  return (
    <div className="flex justify-between items-center w-full mt-6">
      <div className="flex items-center gap-5 text-[14px] font-mono text-slate-800 font-bold">
        <span>1 - 20 of 548</span>
        
        <div className="flex items-center">
          <button className="h-[34px] w-[34px] flex items-center justify-center bg-[#E2E8F0] text-slate-500 hover:bg-[#CBD5E1] transition-colors rounded-l-sm cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          
          <div className="h-[34px] px-5 flex items-center justify-center bg-white text-[13px] text-slate-400 border-y border-[#E2E8F0]">
            Page 1 of 28
          </div>
          
          <button className="h-[34px] w-[34px] flex items-center justify-center bg-[#E2E8F0] text-slate-500 hover:bg-[#CBD5E1] transition-colors rounded-r-sm cursor-pointer">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {children}
    </div>
  );
}