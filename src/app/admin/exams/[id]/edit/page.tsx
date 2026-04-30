"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { X, Save, ExternalLink, Plus, MoreHorizontal, Download, Trash2, CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
// 🔥 ضفنا الاستدعاء ده عشان نفعل الثلاث نقط 🔥
import { AdminActionDropdown } from "@/features/admin/components/AdminActionDropdown";
import type { Diploma, Question, Exam } from "@/types/models";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

export default function EditExamPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const examId = params.id;

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

  // 1. جلب بيانات الامتحان والدبلومات والأسئلة
  useEffect(() => {
    if (!token || !examId) return;

    async function fetchData() {
      try {
        const [examRes, diplomasRes, questionsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/exams/${examId}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/diplomas`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/questions/exam/${examId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (diplomasRes.ok) {
          const dipData = await diplomasRes.json();
          const responsePayload = dipData.payload?.data || dipData.payload || [];
          const actualDiplomas: Diploma[] = Array.isArray(responsePayload) ? responsePayload : [];
          setDiplomas(actualDiplomas);
        }

        if (questionsRes.ok) {
          const qData = await questionsRes.json();
          const responsePayload = qData.payload?.questions || qData.payload || [];
          const actualQuestions: Question[] = Array.isArray(responsePayload) ? responsePayload : [];
          setQuestions(actualQuestions);
        }

        if (examRes.ok) {
          const examData = await examRes.json();
          const exam: Exam = examData.payload?.exam || examData.payload || examData;
          
          setTitle(exam.title || exam.name || "");
          setExamNameOriginal(exam.title || exam.name || "Exam");
          setDescription(exam.description || exam.desc || "");
          setDuration(exam.duration?.toString() || "20");
          setSelectedDiploma(exam.diploma?._id || exam.diplomaId || "");
          setExistingImage(exam.image || exam.imgURL || null);
        } else {
          toast.error("Failed to load exam details");
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Network error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [examId, token]);

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
        
        const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
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

      const updateRes = await fetch(`${BASE_URL}/api/exams/${examId}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100vh]">
        <Loader2 className="animate-spin text-[#175FFF] w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">
      
      <div className="bg-white w-full border-b border-gray-200 px-8 py-5 sticky top-0 z-20 flex justify-between items-start">
        <div>
          <div className="text-[12px] font-mono tracking-wide mb-3 text-gray-400">
            <Link href="/admin/exams" className="hover:text-gray-600 transition-colors">Exams</Link>
            <span className="mx-2">/</span>
            <Link href={`/admin/exams/${examId}`} className="hover:text-gray-600 transition-colors">{examNameOriginal}</Link>
            <span className="mx-2">/</span>
            <span className="text-[#175FFF] font-bold">Edit</span>
          </div>
          
          <h1 className="text-[16px] text-slate-900 font-bold font-sans mb-1">
            {examNameOriginal}
          </h1>
          <div className="text-[12px] font-mono text-slate-400 flex items-center gap-1">
            Diploma: 
            <Link href="#" className="text-slate-400 underline hover:text-[#175FFF] flex items-center gap-1 transition-colors">
              {diplomas.find(d => d._id === selectedDiploma)?.title || "Unknown Diploma"}
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/admin/exams/${examId}`)}
            className="bg-[#F1F5F9] border-transparent text-slate-600 hover:bg-[#E2E8F0] font-mono text-[13px] font-bold h-[36px] px-6 rounded-none shadow-none transition-colors"
          >
            <X size={16} className="mr-2" strokeWidth={2.5} /> Cancel
          </Button>
          
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#00C853] hover:bg-[#00A844] text-white font-mono text-[13px] font-bold h-[36px] px-6 rounded-none shadow-none transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" strokeWidth={2.5} />} 
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="p-8">
        
        <div className="bg-white border border-gray-200 shadow-sm w-full mb-8">
          <div className="bg-[#175FFF] px-6 py-2.5 border-b border-[#175FFF]">
            <h2 className="text-white font-mono text-[13px] font-bold tracking-wide">
              Exam Information
            </h2>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
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
                  {diplomas.map((dip: Diploma) => (
                    <option key={dip._id} value={dip._id}>{dip.title}</option>
                  ))}
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
                      <button onClick={removeImage} type="button" className="text-red-400 hover:text-red-600 transition-colors">
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
                className="rounded-none border-gray-200 font-mono text-[13px] h-10 px-4 focus-visible:ring-1 focus-visible:ring-blue-500 w-full md:w-1/2" 
              />
            </div>

          </div>
        </div>

        {/* 3. منطقة الأسئلة */}
        <div className="bg-white border border-gray-200 shadow-sm w-full">
          <div className="bg-[#175FFF] px-6 py-2.5 flex justify-between items-center">
            <h2 className="text-white font-mono text-[13px] font-bold tracking-wide">
              Exam Questions
            </h2>
            {/* 🔥 التعديل الأول: ربط زرار Add Questions بالصفحة اللي عملناها 🔥 */}
            <Link href={`/admin/exams/${examId}/questions/create`}>
              <Button className="bg-transparent hover:bg-white/10 text-white font-mono text-[12px] font-bold h-[28px] px-3 rounded-none shadow-none transition-colors border border-transparent hover:border-white/20">
                <Plus size={14} className="mr-2" strokeWidth={2.5} /> Add Questions
              </Button>
            </Link>
          </div>

          <div className="bg-[#F1F5F9] px-6 py-2.5 border-b border-gray-200 text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
            <span>Title</span>
          </div>

          <div className="divide-y divide-gray-100">
            {questions.length === 0 ? (
              <div className="p-8 text-center font-mono text-[13px] text-gray-400">
                No questions found.
              </div>
            ) : (
              questions.map((q: Question, idx) => (
                <div key={q._id || q.id || idx} className="flex justify-between items-center px-6 py-3 hover:bg-white transition-colors">
                  <div className="font-mono text-[12px] text-slate-700 font-medium line-clamp-1 pr-4">
                    {q.title || q.questionText || "Question text"}
                  </div>
                  {/* 🔥 التعديل التاني: تفعيل الدروب داون للأسئلة الحقيقية 🔥 */}
                  <div className="shrink-0">
                    <AdminActionDropdown
                      id={q._id || q.id || ""}
                      basePath={`/admin/exams/${examId}/questions`}
                    />
                  </div>
                </div>
              ))
            )}
            
            {/* Fallback Dummy Questions */}
            {questions.length === 0 && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center px-6 py-3 hover:bg-white transition-colors">
                <div className="font-mono text-[12px] text-slate-700 font-medium">What does REST stand for in web development?</div>
                {/* 🔥 التعديل التالت: تفعيل الدروب داون للأسئلة الوهمية عشان تجرب الديزاين 🔥 */}
                <div className="shrink-0">
                  <AdminActionDropdown id={`dummy-${i+1}`} basePath={`/admin/exams/${examId}/questions`} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}