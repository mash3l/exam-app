"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { X, Save, CloudUpload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import type { Diploma } from "@/types/models";
import type { AppSession } from "@/types/auth";

import { clientApiUrl } from "@/lib/client-api";

export default function CreateExamPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const typedSession = session as AppSession | null;
  

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("30"); // قيمة افتراضية
  const [selectedDiploma, setSelectedDiploma] = useState("");
  
  // Image States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // جلب الدبلومات عشان تظهر في الـ Dropdown
  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchDiplomas() {
      try {
        const res = await fetch(clientApiUrl("/api/diplomas"));
        if (res.ok) {
          const dipData = await res.json();
          const responsePayload = dipData.payload?.data || dipData.payload || [];
          setDiplomas(Array.isArray(responsePayload) ? responsePayload : []);
        }
      } catch {
        toast.error("Failed to load diplomas");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDiplomas();
  }, [status]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!title || !selectedDiploma) {
      toast.error("Title and Diploma are required");
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = "";

      // رفع الصورة لو موجودة
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
          toast.error("Failed to upload image");
          setIsSaving(false);
          return;
        }
      }

      // إضافة الامتحان الجديد (POST Request)
      const createRes = await fetch(clientApiUrl("/api/exams"), {
        method: "POST", 
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

      if (createRes.ok) {
        toast.success("Exam created successfully!");
        // بعد الحفظ، بنوجه الأدمن لصفحة الامتحانات
        router.push("/admin/exams");
        router.refresh();
      } else {
        const errorData = await createRes.json();
        toast.error(errorData.message || "Failed to create exam");
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
      
      {/* ─── الهيدر والزراير اللي في الصورة ─── */}
      <div className="bg-white w-full border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
        <div className="min-w-0">
          <div className="text-[11px] sm:text-[12px] font-mono tracking-wide mb-3 text-gray-400 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <Link href="/admin/exams" className="hover:text-gray-600 transition-colors">Exams</Link>
            <span>/</span>
            <span className="text-[#175FFF] font-bold">Create New Exam</span>
          </div>
          
          <h1 className="text-[16px] text-slate-900 font-bold font-sans mb-1">
            Create New Exam
          </h1>
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/exams")}
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
        {/* ─── بيانات الامتحان ─── */}
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
                placeholder="Enter exam title"
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
                {imagePreview ? (
                  <>
                    <div className="flex items-center gap-3">
                      <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover border border-gray-200" />
                      <span className="text-[12px] font-mono text-slate-600 line-clamp-1 max-w-[200px]">
                        {imageFile ? imageFile.name : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pr-2">
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
                    <span className="text-[12px] font-mono">Upload image</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-mono font-bold text-slate-700 mb-2">Description</label>
              <textarea 
                placeholder="Enter exam description"
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
        
        {/* ملحوظة: قسم الأسئلة متشال من هنا لأن الأسئلة بتتضاف بعد ما الامتحان يتكريت ويكون ليه ID */}
        
      </div>
    </div>
  );
}