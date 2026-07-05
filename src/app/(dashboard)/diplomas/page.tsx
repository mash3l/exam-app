import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
import { DiplomasList } from "@/features/diplomas/components/DiplomasList";

function DiplomasSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div
          key={n}
          className="w-full h-[320px] bg-slate-200/50 animate-pulse border border-gray-100"
        />
      ))}
    </div>
  );
}

export default function DiplomasPage() {
  return (
    <div className="animate-in fade-in duration-500 w-full max-w-[1100px] mx-auto">
      <div className="bg-[#175FFF] w-full p-6 flex items-center gap-4 mb-8 rounded-none">
        <GraduationCap className="w-8 h-8 text-white" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-white tracking-wide">Diplomas</h1>
      </div>

      <Suspense fallback={<DiplomasSkeleton />}>
        <DiplomasList />
      </Suspense>
    </div>
  );
}
