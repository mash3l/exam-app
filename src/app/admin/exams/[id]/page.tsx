"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Ban, Edit2, Trash2, Loader2, ExternalLink, Plus, ArrowDownUp, MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { AdminActionDropdown } from "@/features/admin/components/AdminActionDropdown";
import type { Exam, Question } from "@/types/models";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

export default function ViewExamPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const examId = params.id;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || !examId) return;

    async function fetchExamAndQuestions() {
      try {
        const examRes = await fetch(`${BASE_URL}/api/exams/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const examData = await examRes.json();

        const questionsRes = await fetch(`${BASE_URL}/api/questions/exam/${examId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const questionsData = await questionsRes.json();

        if (examRes.ok) {
          const actualExam: Exam = examData.payload?.exam || examData.payload || examData;
          setExam(actualExam);
        } else {
          toast.error("Failed to load exam details");
        }

        if (questionsRes.ok) {
          const responsePayload = questionsData.payload?.questions || questionsData.payload || [];
          const actualQuestions: Question[] = Array.isArray(responsePayload) ? responsePayload : [];
          setQuestions(actualQuestions);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Network error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchExamAndQuestions();
  }, [examId, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100vh]">
        <Loader2 className="animate-spin text-[#175FFF] w-8 h-8" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="p-10 text-center font-mono text-gray-500">
        Exam not found. <Link href="/admin/exams" className="text-blue-500 underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">

      {/* 1. الهيدر العلوي */}
      <div className="bg-white w-full border-b border-gray-200 px-8 py-5 sticky top-0 z-20">

        <div className="text-[12px] font-mono tracking-wide mb-3 text-gray-400">
          <Link href="/admin/exams" className="hover:text-gray-600 transition-colors">
            Exams
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#175FFF] font-bold">{exam.title || exam.name}</span>
        </div>

        <div className="flex justify-between items-start w-full">
          <div>
            <h1 className="text-[16px] text-slate-900 font-bold font-sans mb-1">
              {exam.title || exam.name}
            </h1>
            <div className="text-[12px] font-mono text-slate-400 flex items-center gap-1">
              Diploma:
              <Link href={`/admin/diplomas/${exam.diploma?._id || exam.diplomaId || '#'}`} className="text-slate-400 underline hover:text-[#175FFF] flex items-center gap-1 transition-colors">
                {exam.diploma?.title || exam.diplomaName || "Unknown Diploma"}
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className={`border-transparent font-mono text-[12px] font-bold h-[34px] px-4 rounded-none ${exam.immutable ? 'bg-red-50 text-red-500' : 'bg-[#F1F5F9] text-slate-500 hover:bg-[#E2E8F0] cursor-not-allowed'}`}>
              <Ban size={14} className={`mr-2 ${exam.immutable ? 'text-red-500' : 'text-slate-400'}`} />
              {exam.immutable ? 'Immutable' : 'Immutable'}
            </Button>

            <Link href={`/admin/exams/${examId}/edit`}>
              <Button className="bg-[#175FFF] hover:bg-blue-700 text-white font-mono text-[12px] font-bold h-[34px] px-5 rounded-none shadow-none">
                <Edit2 size={14} className="mr-2" /> Edit
              </Button>
            </Link>

            <Button className="bg-[#F04438] hover:bg-red-700 text-white font-mono text-[12px] font-bold h-[34px] px-5 rounded-none shadow-none">
              <Trash2 size={14} className="mr-2" /> Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 pt-6">
        {/* 2. منطقة عرض المحتوى */}
        <div className="bg-white border border-gray-100 shadow-sm p-6 w-full mb-8">

          <div className="mb-5">
            <h3 className="text-[12px] text-gray-400 font-mono mb-2">Image</h3>
            <img
              src={exam.image || exam.imgURL || "https://placehold.co/200"}
              alt={exam.title}
              className="w-[200px] h-[200px] object-cover bg-gray-50 border border-gray-100"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x200/1E293B/FFF?text=Error" }}
            />
          </div>

          <div className="mb-4">
            <h3 className="text-[12px] text-gray-400 font-mono mb-1">Title</h3>
            <p className="text-[13px] font-bold text-slate-800 font-mono">{exam.title || exam.name}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-[12px] text-gray-400 font-mono mb-1">Description</h3>
            <p className="text-[13px] text-slate-700 leading-relaxed font-mono max-w-[800px]">{exam.description || exam.desc}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-[12px] text-gray-400 font-mono mb-1">Diploma</h3>
            <Link href={`/admin/diplomas/${exam.diploma?._id || exam.diplomaId || '#'}`} className="text-[13px] text-slate-800 font-mono flex items-center gap-1 hover:text-[#175FFF] w-fit">
              {exam.diploma?.title || exam.diplomaName || "Unknown Diploma"} <ExternalLink size={14} className="text-gray-400" />
            </Link>
          </div>

          <div className="mb-4">
            <h3 className="text-[12px] text-gray-400 font-mono mb-1">Duration</h3>
            <p className="text-[13px] font-bold text-slate-800 font-mono">{exam.duration || "20"} Minutes</p>
          </div>

          <div>
            <h3 className="text-[12px] text-gray-400 font-mono mb-1">No. of Questions</h3>
            <p className="text-[13px] font-bold text-slate-800 font-mono">{exam.questionsCount || exam.numberOfQuestions || questions.length || "0"}</p>
          </div>
        </div>

        {/* 3. منطقة جدول الأسئلة */}
        <div className="bg-white border border-gray-200 shadow-sm w-full">
          <div className="bg-[#175FFF] px-6 py-2.5 flex justify-between items-center">
            <h2 className="text-white font-mono text-[13px] font-bold tracking-wide">
              Exam Questions
            </h2>
            <Link href={`/admin/exams/${examId}/questions/create`}>
              <Button className="bg-transparent hover:bg-white/10 text-white font-mono text-[12px] font-bold h-[28px] px-3 rounded-none shadow-none transition-colors border border-transparent hover:border-white/20">
                <Plus size={14} className="mr-2" strokeWidth={2.5} /> Add Questions
              </Button>
            </Link>
          </div>

          <div className="bg-[#F1F5F9] px-6 py-2.5 flex justify-between items-center border-b border-gray-200 text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
            <span>Title</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
              Sort <ArrowDownUp size={12} />
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {questions.length === 0 ? (
              <div className="p-8 text-center font-mono text-[13px] text-gray-400">
                No questions added to this exam yet.
              </div>
            ) : (
              questions.map((q: Question, idx) => (
                <div key={q._id || q.id || idx} className="flex justify-between items-center px-6 py-3 hover:bg-white transition-colors group">
                  <div className="font-mono text-[12px] text-slate-700 font-medium line-clamp-1 pr-4">
                    {q.title || q.questionText || "What does REST stand for in web development?"}
                  </div>

                  <div className="shrink-0">
                    <AdminActionDropdown
                      id={q._id || q.id || `q-${idx}`}
                      basePath={`/admin/exams/${examId}/questions`}
                    />
                  </div>
                </div>
              ))
            )}

            {/* 🔥 التعديل هنا: شيلنا الزرار الوهمي وحطينا الـ Dropdown الحقيقي 🔥 */}
            {questions.length === 0 && (
              <>
                <div className="flex justify-between items-center px-6 py-3 hover:bg-white transition-colors group">
                  <div className="font-mono text-[12px] text-slate-700 font-medium">What does REST stand for in web development?</div>
                  <div className="shrink-0">
                    <AdminActionDropdown id="dummy-1" basePath={`/admin/exams/${examId}/questions`} />
                  </div>
                </div>
                <div className="flex justify-between items-center px-6 py-3 hover:bg-white transition-colors group">
                  <div className="font-mono text-[12px] text-slate-700 font-medium">Explain the Virtual DOM in React.</div>
                  <div className="shrink-0">
                    <AdminActionDropdown id="dummy-2" basePath={`/admin/exams/${examId}/questions`} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}