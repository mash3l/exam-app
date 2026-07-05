"use client";

import Image from "next/image";
import { Clock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation"; // عشان نقرأ الدبلومة الحالية
import { useState } from "react";

interface ExamCardProps {
  title: string;
  description: string;
  questions: number;
  duration: number;
  image: string;
  showStart?: boolean;
  examSlug?: string; // لازم ده عشان الـ routing يشتغل
}

export function ExamCard({ title, description, questions, duration, image, showStart, examSlug }: ExamCardProps) {
  const params = useParams();
  const diplomaId = params?.diplomaId as string;
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = description.length > 150;
  const descriptionText = shouldCollapse && !isExpanded
    ? `${description.slice(0, 150)}...`
    : description;

  return (
    <div className="bg-white border border-gray-100 p-5 flex gap-6 items-start shadow-sm relative rounded-none mb-4 hover:shadow-md transition-shadow">
      
      {/* اللوجو */}
      <div className="w-[100px] h-[100px] bg-[#F8F9FF] flex items-center justify-center shrink-0 border border-gray-50">
        <Image src={image} alt={title} width={56} height={56} className="object-contain" unoptimized />
      </div>

      {/* المحتوى */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-[#175FFF] font-bold text-lg font-mono uppercase tracking-tight">{title}</h3>
          
          <div className="flex flex-col items-end text-[11px] font-mono text-slate-500 gap-1 font-bold">
            <span className="flex items-center gap-1"><HelpCircle size={14} /> {questions} Questions</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {duration} Minutes</span>
          </div>
        </div>
        
        <p className="text-[12px] font-mono text-slate-400 leading-relaxed pr-16 mt-2">
          {descriptionText}{" "}
          {shouldCollapse ? (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-slate-900 font-bold cursor-pointer hover:underline"
            >
              {isExpanded ? "See Less" : "See More"}
            </button>
          ) : null}
        </p>
      </div>

      {/* زرار Start: تأكدت إنه Link وبياخد الـ cursor-pointer */}
      {showStart && examSlug && (
        <Link 
          href={`/exams/${diplomaId}/${examSlug}`} 
          className="absolute bottom-4 right-4 bg-[#175FFF] text-white px-8 py-2.5 text-[11px] font-bold font-mono hover:bg-blue-700 transition-colors uppercase cursor-pointer"
        >
          Start &rarr;
        </Link>
      )}
    </div>
  );
}
