"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Ban, Edit2, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import type { Exam, Question, QuestionOption } from "@/types/models";
import type { AppSession } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

export default function ViewQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const typedSession = session as AppSession | null;
  const token = typedSession?.accessToken;
  const isSuperAdmin = typedSession?.user?.role === "SUPER_ADMIN";
  
  const examId = params.id as string;
  const questionId = params.questionId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || !examId || !questionId) return;

    async function fetchExamAndQuestion() {
      try {
        const examRes = await fetch(`${BASE_URL}/api/exams/${examId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (examRes.ok) {
          const examData = await examRes.json();
          setExam(examData.payload?.exam || examData.payload || examData);
        }

        const questionRes = await fetch(`${BASE_URL}/api/questions/${questionId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (questionRes.ok) {
          const questionData = await questionRes.json();
          setQuestion(questionData.payload?.question || questionData.payload || questionData);
        } else {
          toast.error("Failed to load question details");
        }

      } catch (error) {
        toast.error("Network error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchExamAndQuestion();
  }, [examId, questionId, token]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#175FFF] w-8 h-8" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="p-10 text-center font-mono text-gray-500">
        Question not found. <Link href={`/admin/exams/${examId}`} className="text-blue-500 underline">Go back to Exam</Link>
      </div>
    );
  }

  const handleDeleteQuestion = async () => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can delete questions.");
      return;
    }
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/questions/${questionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(data.message || "Failed to delete question.");
        return;
      }
      toast.success("Question deleted successfully.");
      router.push(`/admin/exams/${examId}`);
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">
      
      {/* 1. الهيدر العلوي */}
      <div className="bg-white w-full border-b border-gray-200 px-8 py-5 sticky top-0 z-20">
        
        {/* مسار التنقل (Breadcrumbs) */}
        <div className="text-[12px] font-mono tracking-wide mb-3 text-gray-400 flex items-center flex-wrap gap-2">
          <Link href="/admin/exams" className="hover:text-gray-600 transition-colors">Exams</Link>
          <span>/</span>
          <Link href={`/admin/exams/${examId}`} className="hover:text-gray-600 transition-colors line-clamp-1 max-w-[150px]" title={exam?.title || "Exam"}>
            {exam?.title || "Exam"}
          </Link>
          <span>/</span>
          <span className="text-gray-400">Questions</span>
          <span>/</span>
          <span className="text-[#175FFF] font-bold line-clamp-1 max-w-[200px]" title={question.title || question.questionText}>
            {question.title || question.questionText || "Question Details"}
          </span>
        </div>
        
        {/* العنوان والزراير */}
        <div className="flex justify-between items-start w-full gap-4">
          <div className="flex-1">
            <h1 className="text-[16px] text-slate-900 font-bold font-sans mb-1 leading-snug">
              {question.title || question.questionText || "What does REST stand for in web development?"}
            </h1>
            <div className="text-[12px] font-mono text-slate-400 flex items-center gap-1">
              Exam: 
              <Link href={`/admin/exams/${examId}`} className="text-slate-400 underline hover:text-[#175FFF] flex items-center gap-1 transition-colors line-clamp-1">
                {exam?.title || exam?.name || "Unknown Exam"}
                <ExternalLink size={12} className="shrink-0" />
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="bg-[#F1F5F9] border-transparent text-slate-500 font-mono text-[12px] font-bold h-[34px] px-4 rounded-none shadow-none cursor-not-allowed">
              <Ban size={14} className="mr-2 text-slate-400" /> Immutable
            </Button>
            
            <Button
              disabled
              className="bg-[#175FFF] text-white font-mono text-[12px] font-bold h-[34px] px-5 rounded-none shadow-none opacity-60 cursor-not-allowed"
              title="Question edit screen is not implemented yet."
            >
              <Edit2 size={14} className="mr-2" /> Edit
            </Button>
            
            <Button
              onClick={handleDeleteQuestion}
              disabled={!isSuperAdmin}
              className="bg-[#F04438] hover:bg-red-700 text-white font-mono text-[12px] font-bold h-[34px] px-5 rounded-none shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={14} className="mr-2" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 pt-6">
        {/* 2. منطقة عرض المحتوى (Card) */}
        <div className="bg-white border border-gray-100 shadow-sm p-6 w-full max-w-5xl">
          
          <div className="mb-6">
            <h3 className="text-[12px] text-gray-400 font-mono mb-1">Headline</h3>
            <p className="text-[13px] font-bold text-slate-800 font-mono leading-relaxed">
              {question.title || question.questionText || "What does REST stand for in web development?"}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-[12px] text-gray-400 font-mono mb-1">Exam</h3>
            <Link href={`/admin/exams/${examId}`} className="text-[13px] text-slate-800 font-mono flex items-center gap-1 hover:text-[#175FFF] w-fit">
              {exam?.title || exam?.name || "Final Full Stack Development Certification Exam"} <ExternalLink size={14} className="text-gray-400" />
            </Link>
          </div>

          <div>
            <h3 className="text-[12px] text-gray-400 font-mono mb-2">Answers</h3>
            
            {question.options && Array.isArray(question.options) ? (
              <ul className="list-disc list-inside text-[13px] font-bold text-slate-800 font-mono space-y-2 mt-2">
                {question.options.map((opt: QuestionOption, idx: number) => (
                  <li key={idx} className={opt.isCorrect ? "text-[#00C853]" : "text-slate-600"}>
                    {opt.text || opt.title || ""} {opt.isCorrect && <span className="text-[11px] bg-[#E8F5E9] text-[#00C853] px-2 py-0.5 ml-2 rounded-full border border-[#00C853]/20">Correct</span>}
                  </li>
                ))}
              </ul>
            ) : question.answers && Array.isArray(question.answers) ? (
               <ul className="list-disc list-inside text-[13px] font-bold text-slate-800 font-mono space-y-1 mt-2">
                {question.answers.map((ans: QuestionOption, idx: number) => (
                  <li key={idx}>{ans.text || ans.title || "Answer"}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] font-bold text-slate-800 font-mono mt-2">
                {question.answersCount || "10"}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}