"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface AdminDeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  isDeleting?: boolean;
}

export function AdminDeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "this item",
  isDeleting = false 
}: AdminDeleteConfirmModalProps) {
  
  if (!isOpen) return null;

  return (
    // الخلفية السودة الشفافة
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* صندوق الـ Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[450px] relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* علامة الـ X للقفل */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-8 pt-10 text-center">
          {/* الأيقونة الحمراء */}
          <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-red-100/50 rounded-full flex items-center justify-center">
              <AlertTriangle size={28} className="text-[#F04438]" strokeWidth={2} />
            </div>
          </div>

          <h2 className="text-[#F04438] text-[18px] font-bold font-mono tracking-wide mb-3">
            Are you sure you want to delete {title}?
          </h2>
          <p className="text-gray-500 font-mono text-[13px]">
            This action is permanent and cannot be undone.
          </p>
        </div>

        {/* الأزرار تحت */}
        <div className="bg-[#F8FAFC] border-t border-gray-100 p-5 flex gap-4">
          <Button 
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 bg-[#E2E8F0] hover:bg-slate-300 text-slate-700 font-mono font-bold text-[13px] h-10 rounded-none shadow-none cursor-pointer transition-colors"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 bg-[#F04438] hover:bg-red-700 text-white font-mono font-bold text-[13px] h-10 rounded-none shadow-none cursor-pointer transition-colors"
          >
            {isDeleting ? "Deleting..." : "Yes, delete"}
          </Button>
        </div>

      </div>
    </div>
  );
}