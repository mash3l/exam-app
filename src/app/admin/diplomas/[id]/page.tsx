"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Ban, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import type { Diploma } from "@/types/models";

export default function ViewDiplomaPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  
  const diplomaId = params.id;

  const [diploma, setDiploma] = useState<Diploma | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || !diplomaId) return;

    async function fetchSingleDiploma() {
      try {
        const res = await fetch(`https://exam-app.elevate-bootcamp.cloud/api/diplomas/${diplomaId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const responseData = await res.json();
        
        if (res.ok) {
          // 🔥 التعديل هنا: الداتا مستخبية جوه payload.diploma زي ما الـ Console قال 🔥
          const actualData: Diploma = responseData.payload?.diploma || responseData.payload || responseData;
          setDiploma(actualData);
        } else {
          toast.error("Failed to load diploma details");
        }
      } catch (error) {
        console.error("Error fetching diploma:", error);
        toast.error("Network error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchSingleDiploma();
  }, [diplomaId, token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100vh]">
        <Loader2 className="animate-spin text-[#175FFF] w-8 h-8" />
      </div>
    );
  }

  if (!diploma) {
    return (
      <div className="p-10 text-center font-mono text-gray-500">
        Diploma not found. <Link href="/admin/diplomas" className="text-blue-500 underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">
      
      {/* 1. الهيدر العلوي */}
      <div className="bg-white w-full border-b border-gray-200 px-8 py-6 sticky top-0 z-20">
        
        <div className="text-[12px] font-mono tracking-wide mb-4 text-gray-400">
          <Link href="/admin/diplomas" className="hover:text-gray-600 transition-colors">
            Diplomas
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#175FFF] font-bold">{diploma.title || diploma.name}</span>
        </div>
        
        <div className="flex justify-between items-center w-full">
          <h1 className="text-[16px] text-slate-900 font-bold font-sans">
            {diploma.title || diploma.name}
          </h1>
          
          <div className="flex items-center gap-3">
            {/* ممكن نربط حالة الزرار ده بقيمة diploma.immutable اللي راجعة من السيرفر */}
            <Button variant="outline" className={`border-transparent font-mono text-[12px] font-bold h-[36px] px-4 rounded-none ${diploma.immutable ? 'bg-red-50 text-red-500' : 'bg-[#F1F5F9] text-slate-500 hover:bg-[#E2E8F0] cursor-not-allowed'}`}>
              <Ban size={14} className={`mr-2 ${diploma.immutable ? 'text-red-500' : 'text-slate-400'}`} /> 
              {diploma.immutable ? 'Immutable (Locked)' : 'Immutable'}
            </Button>
            
            <Button className="bg-[#175FFF] hover:bg-blue-700 text-white font-mono text-[12px] font-bold h-[36px] px-5 rounded-none shadow-none">
              <Edit2 size={14} className="mr-2" /> Edit
            </Button>
            
            <Button className="bg-[#F04438] hover:bg-red-700 text-white font-mono text-[12px] font-bold h-[36px] px-5 rounded-none shadow-none">
              <Trash2 size={14} className="mr-2" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* 2. منطقة عرض المحتوى */}
      <div className="p-8">
        <div className="bg-white border border-gray-100 shadow-sm p-8 max-w-[800px]">
          
          {/* قسم الصورة */}
          <div className="mb-8">
            <h3 className="text-[12px] text-gray-400 font-mono mb-3">Image</h3>
            <img 
              src={diploma.image || "https://placehold.co/400"} 
              alt={diploma.title} 
              className="w-[300px] h-[300px] object-cover bg-gray-50 border border-gray-100"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x300/1E293B/FFF?text=Error" }}
            />
          </div>

          {/* قسم العنوان */}
          <div className="mb-8">
            <h3 className="text-[12px] text-gray-400 font-mono mb-2">Title</h3>
            <p className="text-[14px] font-bold text-slate-800 font-mono">
              {diploma.title}
            </p>
          </div>

          {/* قسم الوصف */}
          <div>
            <h3 className="text-[12px] text-gray-400 font-mono mb-2">Description</h3>
            <p className="text-[13px] text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-w-[700px]">
              {diploma.description}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}