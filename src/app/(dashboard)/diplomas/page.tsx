import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { DiplomaCard } from "@/features/diplomas/components/DiplomaCard";
import { GraduationCap, ChevronDown, AlertCircle } from "lucide-react";
import { Diploma } from "@/features/diplomas/types";
import { API_BASE_URL } from "@/lib/api-base";
import { authOptions } from "@/auth";

// 1. الجزء الثابت (Skeleton): هيظهر للمستخدم فوراً لحد ما الداتا تحمل
function DiplomasSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="w-full h-[320px] bg-slate-200/50 animate-pulse border border-gray-100" />
      ))}
    </div>
  );
}

// 2. الجزء المتغير (Server Component): بيكلم الـ API مباشرة
async function DiplomasData() {
  try {
    const session = await getServerSession(authOptions);
    const token =
      session?.accessToken?.trim() ||
      process.env.NEXT_PUBLIC_DEV_API_TOKEN?.trim() ||
      undefined;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/diplomas`, {
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status}`);
    }

    const responseData = await res.json();
    
    // سحب مصفوفة الدبلومات من الـ Payload
    const diplomasList: Diploma[] = responseData?.payload?.data || responseData?.data || [];

    // لو مفيش داتا في السيرفر
    if (diplomasList.length === 0) {
      return (
        <div className="col-span-3 text-center text-slate-500 py-10 font-mono">
          No diplomas found on the server. (Database might be empty!)
        </div>
      );
    }

    // رسم الكروت بالداتا الحقيقية
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diplomasList.map((diploma: Diploma) => {
            const rowId = diploma.id ?? diploma._id;
            if (!rowId) return null;
            return (
              <DiplomaCard
                key={rowId}
                id={rowId}
                title={diploma.title}
                description={diploma.description}
                image={diploma.image}
              />
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-center gap-1 text-gray-500 mt-12 mb-8">
          <span className="text-[12px] font-mono tracking-wide">Scroll to view more</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </>
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch data";
    return (
      <div className="flex flex-col items-center justify-center mt-32">
        <AlertCircle className="w-16 h-16 text-[#F04438] mb-4" />
        <h2 className="text-xl font-bold text-slate-800 font-mono tracking-tight">Oops! Something went wrong</h2>
        <p className="text-slate-500 mt-2 font-mono text-[13px]">{message}</p>
      </div>
    );
  }
}

// 3. الصفحة الرئيسية (Shell)
export default function DiplomasPage() {
  return (
    <div className="animate-in fade-in duration-500 w-full max-w-[1100px] mx-auto">
      
      {/* الهيدر الأزرق (Static) */}
      <div className="bg-[#175FFF] w-full p-6 flex items-center gap-4 mb-8 rounded-none">
        <GraduationCap className="w-8 h-8 text-white" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-white tracking-wide">Diplomas</h1>
      </div>

      {/* استخدام Suspense لضمان ظهور الـ Skeleton أثناء جلب الداتا من السيرفر */}
      <Suspense fallback={<DiplomasSkeleton />}>
        <DiplomasData />
      </Suspense>

    </div>
  );
}