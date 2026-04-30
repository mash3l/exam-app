"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, LayoutList, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ExamCard } from "@/features/exams/components/ExamCard";
import { useExams } from "@/features/exams/hooks/useExams";
import type { Exam } from "@/types/models";

function ExamsContent() {
  const params = useParams();
  const diplomaId = params?.diplomaId as string;

  const { data: responseData, isLoading, isError } = useExams(diplomaId);
  const rawList = responseData?.payload?.data || responseData?.data || responseData || [];
  const realExams = rawList as Exam[];

  const diplomaExams = realExams.filter(
    (exam) => exam.diplomaId === diplomaId || !exam.diplomaId
  );

  // 💡 استخراج اسم الدبلومة:
  // بنحاول نجيب الاسم الحقيقي من أول امتحان راجع، لو مفيش بنعرض نص نظيف بدل الـ ID الغريب
  const firstExam: Exam | undefined = diplomaExams[0];
  const actualDiplomaName = firstExam?.diploma?.title || firstExam?.diplomaName || "Available Exams";

  // الدالة السحرية اللي بتصلح مسار الصورة
  const getValidImage = (img?: string) => {
    if (!img) return "https://images.unsplash.com/photo-1617042375876-a13e36732a04"; 
    if (img.startsWith("http")) return img; 
    return `https://exam-app.elevate-bootcamp.cloud${img.startsWith('/') ? '' : '/'}${img}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] gap-3">
        <Loader2 className="w-8 h-8 text-[#175FFF] animate-spin" />
        <p className="text-slate-500 font-mono text-sm">Loading exams...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] gap-3">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="text-slate-500 font-mono text-sm">Failed to load exams.</p>
      </div>
    );
  }

  return (
    // 💡 التعديل: pt-20 عشان زرار الموبايل بتاع السايد بار، و padding عشان الشاشات الصغيرة
    <div className="max-w-[1000px] mx-auto py-2 pt-20 md:pt-4 px-4 md:px-0 animate-in fade-in duration-700">
      
      {/* ── Breadcrumbs ── */}
      <nav className="text-[11px] font-mono text-gray-400 flex flex-wrap gap-2 items-center mb-6">
        <Link href="/diplomas" className="hover:text-[#175FFF] cursor-pointer transition-colors">Diplomas</Link> 
        <span>/</span>
        {/* حطينا الاسم الحقيقي هنا كمان بدل الـ ID */}
        <span className="truncate max-w-[150px] md:max-w-[300px] capitalize">{actualDiplomaName}</span> 
        <span>/</span>
        <span className="text-[#175FFF] font-bold">Exams</span>
      </nav>

      {/* ── Header (Responsive) ── */}
      {/* 💡 التعديل: flex-col في الموبايل عشان ميكسروش بعض، و flex-row في الديسكتوب */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-8">
        <Link 
          href="/diplomas" 
          className="w-full md:w-auto bg-white border border-gray-200 p-3 md:p-4 flex items-center justify-center text-[#175FFF] hover:bg-gray-50 transition-all shadow-sm cursor-pointer rounded-[4px]"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="mr-2 md:mr-0" />
          {/* ضفت كلمة Back في الموبايل عشان الزرار يبقى واضح ومالي مركزه */}
          <span className="md:hidden font-mono font-bold text-[13px] uppercase">Back to Diplomas</span>
        </Link>
        
        <div className="flex-1 bg-[#175FFF] text-white p-4 md:p-5 flex items-center gap-4 shadow-sm rounded-[4px]">
          <LayoutList size={28} className="shrink-0" />
          {/* 💡 التعديل: تصغير الخط في الموبايل (text-lg) عشان الكلام ميتداخلش */}
          <h1 className="text-lg md:text-2xl font-bold font-mono uppercase tracking-tight line-clamp-2">
            {actualDiplomaName}
          </h1>
        </div>
      </div>

      {/* ── Exams List ── */}
      {diplomaExams.length > 0 ? (
        <div className="flex flex-col gap-4">
          {diplomaExams.map((exam: Exam) => (
            <ExamCard 
              key={exam.id || exam._id} 
              title={exam.title}
              questions={exam.questionsCount || 25}
              duration={exam.duration || 60}
              image={getValidImage(exam.image)} 
              description={exam.description || "No description available"}
              showStart={true} 
              examSlug={exam.id || exam._id} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-[4px]">
          <LayoutList size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-mono text-[13px]">No exams available for this diploma yet.</p>
        </div>
      )}

      <div className="text-center py-10 text-gray-400 font-mono text-[10px] uppercase tracking-widest">
        End of list
      </div>
    </div>
  );
}

// الدالة الأساسية اللي بتغلف المحتوى بالـ Suspense
export default function ExamsListPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[100vh] gap-3">
          <Loader2 className="w-8 h-8 text-[#175FFF] animate-spin" />
          <span className="font-mono text-slate-500 text-sm">Loading exams...</span>
        </div>
      }
    >
      <ExamsContent />
    </Suspense>
  );
}