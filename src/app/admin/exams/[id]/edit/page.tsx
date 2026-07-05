"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { X, Save, ExternalLink, Plus, Download, Trash2, CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import { AdminActionDropdown } from "@/features/admin/components/AdminActionDropdown";
import type { Diploma, Question, Exam } from "@/types/models";
import type { AppSession } from "@/types/auth";

import { clientApiUrl } from "@/lib/client-api";

// ─── 1. كومبوننت الأسئلة (فصلناه هنا عشان الملف ميكونش زحمة) ───
function ExamQuestionsSection({ examId, questions }: { examId: string; questions: Question[] }) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm w-full">
      <div className="bg-[#175FFF] px-4 sm:px-6 py-2.5 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center border-b border-[#175FFF]">
        <h2 className="text-white font-mono text-[13px] font-bold tracking-wide">
          Exam Questions
        </h2>
        <Link href={`/admin/exams/${examId}/questions/create`}>
          <Button className="bg-transparent hover:bg-white/10 text-white font-mono text-[12px] font-bold h-[28px] px-3 rounded-none shadow-none transition-colors border border-transparent hover:border-white/20 cursor-pointer">
            <Plus size={14} className="mr-2" strokeWidth={2.5} /> Add Questions
          </Button>
        </Link>
      </div>

      <div className="bg-[#F1F5F9] px-4 sm:px-6 py-2.5 border-b border-gray-200 text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
        <span>Title</span>
      </div>

      <div className="divide-y divide-gray-100">
        {questions.length === 0 ? (
          <div className="px-4 sm:px-6 py-6 text-center font-mono text-[12px] text-slate-500">
            No questions found for this exam.
          </div>
        ) : (
          // لو في أسئلة حقيقية جاية من الداتا بيز
          questions.map((q: Question, idx) => {
            // حل مشكلة الـ Key هنا كمان احتياطي
            const uniqueKey = q._id || q.id || `q-${idx}`;
            return (
              <div key={uniqueKey} className="flex justify-between items-center px-4 sm:px-6 py-3 hover:bg-white transition-colors">
                <div className="font-mono text-[12px] text-slate-700 font-medium line-clamp-1 pr-4">
                  {q.title || q.questionText || "Question text"}
                </div>
                <div className="shrink-0">
                  <AdminActionDropdown
                    id={q._id || q.id || ""}
                    basePath={`/admin/exams/${examId}/questions`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── 2. الصفحة الرئيسية (الفورمة الأساسية) ───
export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const typedSession = session as AppSession | null;
  
  const examId = params.id as string;

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedDiploma, setSelectedDiploma] = useState("");
  const [examNameOriginal, setExamNameOriginal] = useState("");
  
  // Image States
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status !== "authenticated" || !examId) return;

    async function fetchData() {
      try {
        const [examRes, diplomasRes, questionsRes] = await Promise.all([
          fetch(clientApiUrl(`/api/exams/${examId}`)),
          fetch(clientApiUrl("/api/diplomas")),
          fetch(clientApiUrl(`/api/questions/exam/${examId}`))
        ]);

        if (diplomasRes.ok) {
          const dipData = await diplomasRes.json();
          const responsePayload = dipData.payload?.data || dipData.payload || [];
          setDiplomas(Array.isArray(responsePayload) ? responsePayload : []);
        }

        if (questionsRes.ok) {
          const qData = await questionsRes.json();
          const responsePayload = qData.payload?.questions || qData.payload || [];
          setQuestions(Array.isArray(responsePayload) ? responsePayload : []);
        }

        if (examRes.ok) {
          const examData = await examRes.json();
          const exam: Exam = examData.payload?.exam || examData.payload || examData;
          
          setTitle(exam.title || exam.name || "");
          setExamNameOriginal(exam.title || exam.name || "Exam");
          setDescription(exam.description || exam.desc || "");
          setDuration(exam.duration?.toString() || "20");
          setSelectedDiploma((exam.diploma?._id || exam.diplomaId || exam.diploma || "") as string);
          setExistingImage(exam.image || exam.imgURL || null);
        } else {
          toast.error("Failed to load exam details");
        }

      } catch {
        toast.error("Network error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [examId, status]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImage(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!title || !selectedDiploma) {
      toast.error("Title and Diploma are required");
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = existingImage;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile); 
        
        const uploadRes = await fetch(clientApiUrl("/api/upload"), {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url || uploadData.payload?.url || uploadData.payload || "";
        } else {
          toast.error("Failed to upload new image");
          setIsSaving(false);
          return;
        }
      }

      const updateRes = await fetch(clientApiUrl(`/api/exams/${examId}`), {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          duration: Number(duration),
          diplomaId: selectedDiploma, 
          image: finalImageUrl,
        }),
      });

      if (updateRes.ok) {
        toast.success("Exam updated successfully!");
        router.push(`/admin/exams/${examId}`);
        router.refresh();
      } else {
        const errorData = await updateRes.json();
        toast.error(errorData.message || "Failed to update exam");
      }
    } catch {
      toast.error("Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#175FFF] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">
      
      {/* ─── Header ─── */}
      <div className="bg-white w-full border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 top-0 z-20 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="min-w-0">
          <div className="text-[11px] sm:text-[12px] font-mono tracking-wide mb-3 text-gray-400 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <Link href="/admin/exams" className="hover:text-gray-600 transition-colors">Exams</Link>
            <span>/</span>
            <Link href={`/admin/exams/${examId}`} className="hover:text-gray-600 transition-colors truncate max-w-[160px]">{examNameOriginal}</Link>
            <span>/</span>
            <span className="text-[#175FFF] font-bold">Edit</span>
          </div>
          
          <h1 className="text-[16px] text-slate-900 font-bold font-sans mb-1">
            {examNameOriginal}
          </h1>
          <div className="text-[12px] font-mono text-slate-400 flex items-center gap-1 min-w-0">
            Diploma: 
            <Link
              href={selectedDiploma ? `/admin/diplomas/${selectedDiploma}` : "/admin/diplomas"}
              className="text-slate-400 underline hover:text-[#175FFF] flex items-center gap-1 transition-colors truncate max-w-[220px]"
            >
              {diplomas.find(d => (d._id || d.id) === selectedDiploma)?.title || "Unknown Diploma"}
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/exams/${examId}`)}
            className="w-full sm:w-auto bg-[#F1F5F9] border-transparent text-slate-600 hover:bg-[#E2E8F0] font-mono text-[13px] font-bold h-[36px] px-6 rounded-none shadow-none transition-colors cursor-pointer"
          >
            <X size={16} className="mr-2" strokeWidth={2.5} /> Cancel
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#00C853] hover:bg-[#00A844] text-white font-mono text-[13px] font-bold h-[36px] px-6 rounded-none shadow-none transition-colors cursor-pointer disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" strokeWidth={2.5} />} 
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* ─── Form Data ─── */}
        <div className="bg-white border border-gray-200 shadow-sm w-full mb-8">
          <div className="bg-[#175FFF] px-6 py-2.5 border-b border-[#175FFF]">
            <h2 className="text-white font-mono text-[13px] font-bold tracking-wide">
              Exam Information
            </h2>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            
            <div>
              <label className="block text-[12px] font-mono font-bold text-slate-700 mb-2">Title</label>
              <Input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-none border-gray-200 font-mono text-[13px] h-10 px-4 focus-visible:ring-1 focus-visible:ring-blue-500 w-full" 
              />
            </div>

            <div>
              <label className="block text-[12px] font-mono font-bold text-slate-700 mb-2">Diploma</label>
              <div className="relative">
                <select 
                  value={selectedDiploma}
                  onChange={(e) => setSelectedDiploma(e.target.value)}
                  className="h-10 w-full border border-gray-200 bg-white px-4 font-mono text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-none appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Diploma</option>
                  {diplomas.map((dip: Diploma, idx) => {
                    // 🔥 حل مشكلة الـ Key اللي كانت بتطلعلك في الكونسول 🔥
                    const dipId = dip._id || dip.id || `dip-${idx}`;
                    return (
                      <option key={dipId} value={dipId}>{dip.title}</option>
                    );
                  })}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-mono font-bold text-slate-700 mb-2">Image</label>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              
              <div className="border border-gray-200 p-2 flex items-center justify-between bg-gray-50/50 min-h-[64px]">
                {(existingImage || imagePreview) ? (
                  <>
                    <div className="flex items-center gap-3">
                      <img 
                        src={imagePreview || existingImage || ""} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover border border-gray-200" 
                      />
                      <div className="flex flex-col">
                        <span className="text-[12px] font-mono text-slate-600 line-clamp-1 max-w-[200px]">
                          {imageFile ? imageFile.name : "existing_image.png"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pr-2">
                      <span className="text-[10px] font-mono text-gray-400">
                        {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                      </span>
                      {existingImage && (
                         <a href={existingImage} target="_blank" rel="noreferrer" className="text-[#175FFF] hover:text-blue-700 transition-colors">
                           <Download size={14} />
                         </a>
                      )}
                      <button onClick={removeImage} type="button" className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 cursor-pointer text-gray-400 hover:text-[#175FFF] transition-colors py-2"
                  >
                    <CloudUpload size={18} />
                    <span className="text-[12px] font-mono">Upload new image</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-mono font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-200 p-3 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 h-[64px] resize-none text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[12px] font-mono font-bold text-slate-700 mb-2">Duration (min)</label>
              <Input 
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="rounded-none border-gray-200 font-mono text-[13px] h-10 px-4 focus-visible:ring-1 focus-visible:ring-blue-500 w-full lg:w-1/2" 
              />
            </div>

          </div>
        </div>

        {/* ─── استدعاء كومبوننت الأسئلة الجديد ─── */}
        <ExamQuestionsSection examId={examId} questions={questions} />

      </div>
    </div>
  );
}