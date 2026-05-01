"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { X, Save, Image as ImageIcon, CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import type { AppSession } from "@/types/auth";
import type { Diploma } from "@/types/models";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

interface CreateDiplomaFormProps {
  initialData?: Diploma | null;
  isEditMode?: boolean;
}

export default function CreateDiplomaForm({ initialData, isEditMode = false }: CreateDiplomaFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const typedSession = session as AppSession | null;
  const token = typedSession?.accessToken;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // تعبئة البيانات لو إحنا في وضع التعديل
  useEffect(() => {
    if (isEditMode && initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setImagePreview(initialData.image || null);
    }
  }, [isEditMode, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title || !description) {
      toast.error("Please fill in all required fields (Title & Description)");
      return;
    }

    if (!isEditMode && !imageFile && !imagePreview) {
      toast.error("Please upload an image for the diploma");
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = initialData?.image || "";

      // 1. رفع الصورة الجديدة لو اليوزر اختار صورة
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
          toast.error("Failed to upload image.");
          setIsSaving(false);
          return;
        }
      }

      // 2. تحديد المسار والـ Method
      const initialDataId = initialData?._id || initialData?.id;
      const endpoint = isEditMode 
        ? `${BASE_URL}/api/diplomas/${initialDataId}` 
        : `${BASE_URL}/api/diplomas`;
      
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          image: finalImageUrl,
        }),
      });

      if (res.ok) {
        toast.success(`Diploma ${isEditMode ? 'updated' : 'created'} successfully!`);
        router.push("/admin/diplomas"); 
        router.refresh(); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} diploma`);
      }
    } catch {
      toast.error("A network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">
      {/* ─── Header ─── */}
      <div className="bg-white w-full border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-20 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="text-[12px] sm:text-[13px] font-mono tracking-wide flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/admin/diplomas" className="text-gray-400 hover:text-gray-600 transition-colors">Diplomas</Link>
          <span className="text-gray-400">/</span>
          <span className="text-[#175FFF] font-bold">{isEditMode ? "Edit Diploma" : "Add New Diploma"}</span>
        </div>
        
        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/diplomas")}
            disabled={isSaving}
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

      {/* ─── Form ─── */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white border border-gray-200 shadow-sm w-full">
          <div className="bg-[#175FFF] px-6 py-3 border-b border-[#175FFF]">
            <h2 className="text-white font-mono text-[13px] font-bold tracking-wide">Diploma Information</h2>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-4xl">
            {/* Image Upload */}
            <div>
              <label className="block text-[13px] font-mono font-bold text-slate-700 mb-3">Image</label>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
              <div onClick={() => fileInputRef.current?.click()} className="w-full border border-gray-200 p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors group">
                {imagePreview ? (
                  <div className="w-full flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <img src={imagePreview} alt="Preview" className="w-12 h-12 object-cover border border-gray-200 rounded-sm" />
                       <span className="text-[12px] font-mono text-slate-600 font-bold">{imageFile ? imageFile.name : "Current Image"}</span>
                     </div>
                     <span className="text-[12px] font-mono text-blue-500 hover:underline">Change image</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 flex items-center justify-center border border-gray-100 bg-gray-50 text-gray-300 group-hover:text-gray-400 transition-colors">
                      <ImageIcon size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <CloudUpload size={20} className="text-gray-400 mb-2" strokeWidth={1.5} />
                      <p className="text-[12px] font-mono text-gray-500">Drop an image here or <span className="text-[#175FFF]">select from your computer</span></p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-[13px] font-mono font-bold text-slate-700 mb-3">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter diploma title" className="rounded-none border-gray-200 font-mono text-[13px] h-10 px-4 focus-visible:ring-1 focus-visible:ring-blue-500 w-full" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[13px] font-mono font-bold text-slate-700 mb-3">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter diploma description" className="w-full border border-gray-200 p-4 text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[160px] resize-y placeholder:text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}