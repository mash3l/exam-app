import { X, AlertTriangle, Loader2 } from "lucide-react";

type ClearLogsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isClearing: boolean;
};

export function ClearLogsModal({ isOpen, onClose, onConfirm, isClearing }: ClearLogsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[4px] p-8 w-full max-w-[420px] shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border-[6px] border-red-50/50">
            <AlertTriangle size={28} className="text-[#F04438]" strokeWidth={2} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-[#F04438] font-mono text-[16px] font-bold mb-2">Are you sure you want to clear all logs?</h3>
          <p className="text-slate-500 font-mono text-[12px]">This action is permanent and cannot be undone.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            disabled={isClearing}
            className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 font-mono text-[13px] font-bold h-11 rounded-[4px] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isClearing}
            className="flex-1 bg-[#F04438] hover:bg-red-600 text-white font-mono text-[13px] font-bold h-11 rounded-[4px] transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isClearing ? <Loader2 size={16} className="animate-spin" /> : "Yes, clear"}
          </button>
        </div>
      </div>
    </div>
  );
}