"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Ban, Edit2, Trash2, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { AdminDeleteConfirmModal } from "@/features/admin/components/AdminDeleteConfirmModal";
import type { AppSession } from "@/types/auth";
import type { Diploma } from "@/types/models";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

export default function ViewDiplomaPage() {
  const router = useRouter();
  const params = useParams();
  const diplomaId = params.id as string;
  
  const { data: session } = useSession();
  const typedSession = session as AppSession | null;
  const token = typedSession?.accessToken;
  const isSuperAdmin = typedSession?.user?.role === "SUPER_ADMIN";

  const [diploma, setDiploma] = useState<Diploma | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!token || !diplomaId) return;

    async function fetchDiploma() {
      try {
        const res = await fetch(`${BASE_URL}/api/diplomas/${diplomaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          // التعديل السحري: بندور على الداتا في كل الأماكن المحتملة عشان نربطها صح
          const actualDiploma = data.payload?.diploma || data.payload?.data || data.payload || data.data || data;
          setDiploma(actualDiploma);
        } else {
          toast.error("Failed to load diploma details");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDiploma();
  }, [diplomaId, token]);

  const handleDelete = async () => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can delete diplomas.");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/diplomas/${diplomaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Diploma deleted successfully");
        setIsDeleteModalOpen(false);
        router.push("/admin/diplomas");
        router.refresh();
      } else {
        toast.error("Failed to delete diploma");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[#175FFF] w-10 h-10" /></div>;
  if (!diploma) return <div className="p-20 text-center text-gray-500 font-mono">Diploma not found.</div>;

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">
      
      {/* ─── Header ─── */}
      <div className="bg-white w-full border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-20 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center shadow-sm">
        <div className="text-[11px] sm:text-[12px] font-mono tracking-wide text-gray-400 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/admin/diplomas" className="hover:text-gray-600 transition-colors">Diplomas</Link>
          <span>/</span>
          <span className="text-[#175FFF] font-bold truncate max-w-[220px]">{diploma?.title || "Unknown Title"}</span>
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
          <Button variant="outline" className="w-full sm:w-auto border-transparent bg-[#F1F5F9] text-slate-500 font-mono text-[12px] font-bold h-[34px] px-4 rounded-none cursor-default">
            <Ban size={14} className="mr-2 text-slate-400" /> Immutable
          </Button>

          <Button 
            onClick={() => router.push(`/admin/diplomas/${diplomaId}/edit`)}
            className="w-full sm:w-auto bg-[#175FFF] hover:bg-blue-700 text-white font-mono text-[12px] font-bold h-[34px] px-5 rounded-none shadow-none cursor-pointer transition-colors"
          >
            <Edit2 size={14} className="mr-2" /> Edit
          </Button>

          <Button 
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!isSuperAdmin}
            className="w-full sm:w-auto bg-[#F04438] hover:bg-red-700 text-white font-mono text-[12px] font-bold h-[34px] px-5 rounded-none shadow-none cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={14} className="mr-2" /> Delete
          </Button>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-white border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-8 w-full max-w-4xl">
          
          <div className="mb-8">
            <h3 className="text-[12px] text-gray-400 font-mono mb-3 uppercase tracking-wider">Image</h3>
            {diploma?.image ? (
              <img 
                src={diploma.image} 
                alt={diploma?.title} 
                className="w-full max-w-[322px] h-[240px] sm:h-[300px] object-cover bg-gray-50 border border-gray-200 rounded-sm shadow-sm" 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/300x300/1E293B/FFF?text=Image+Error" }}
              />
            ) : (
              <div className="w-full max-w-[300px] h-[240px] sm:h-[300px] bg-gray-50 border border-gray-200 flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={40} className="mb-2 opacity-50" />
                <span className="text-[12px] font-mono">No image provided</span>
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h3 className="text-[12px] text-gray-400 font-mono mb-2 uppercase tracking-wider">Title</h3>
            <p className="text-[15px] font-bold text-slate-800 font-mono bg-slate-50 p-4 border border-slate-100 rounded-sm">
              {diploma?.title || "No title available"}
            </p>
          </div>
          
          <div>
            <h3 className="text-[12px] text-gray-400 font-mono mb-2 uppercase tracking-wider">Description</h3>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm">
              <p className="text-[13px] text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
                {diploma?.description || "No description available"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Delete Modal ─── */}
      <AdminDeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={`"${diploma?.title || 'this diploma'}"`}
        isDeleting={isDeleting}
      />
    </div>
  );
}