import { Loader2 } from "lucide-react";

export default function ExamsLoadingSkeleton() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-3">
      {/* أيقونة التحميل بتلف */}
      <Loader2 className="w-10 h-10 text-[#175FFF] animate-spin" />
      
      {/* نص بسيط (اختياري، تقدر تشيله لو حابب) */}
      <p className="text-slate-500 font-mono text-[13px]">Loading...</p>
    </div>
  );
}