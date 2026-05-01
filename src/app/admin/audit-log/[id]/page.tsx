"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Trash2, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { AppSession } from "@/types/auth";
import type { AuditLog, AuditMetadata } from "@/types/audit";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

export default function AuditLogViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = useSession();
  const typedSession = session as AppSession | null;
  const token = typedSession?.accessToken;
  const isSuperAdmin = typedSession?.user?.role === "SUPER_ADMIN";

  const [log, setLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    
    async function fetchLog() {
        try {
          const res = await fetch(`${BASE_URL}/api/admin/audit-logs/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = (await res.json()) as {
            message?: string;
            payload?: { auditLog?: AuditLog; data?: AuditLog } | AuditLog;
          };
          
          if (res.ok) {
            // 💡 السطر ده هيصطاد الداتا مهما كان الباك إند مغلفها إزاي!
            const payload = data.payload;
            const actualLog =
              (payload && "auditLog" in payload && payload.auditLog) ||
              (payload && "data" in payload && payload.data) ||
              (payload as AuditLog) ||
              null;
            setLog(actualLog);
          } else {
            toast.error(data.message || "Failed to load log details");
            router.push("/admin/audit-log");
          }
        } catch {
          toast.error("Network error");
          router.push("/admin/audit-log");
        } finally {
          setIsLoading(false);
        }
      }

    fetchLog();
  }, [id, token, router]);

  const handleDelete = async () => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can delete logs.");
      return;
    }
    if (!confirm("Are you sure you want to delete this log?")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/audit-logs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Log deleted successfully");
        router.push("/admin/audit-log");
      } else {
        const data = (await res.json()) as { message?: string };
        toast.error(data.message || "Failed to delete log");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 text-[#175FFF] animate-spin" /></div>;
  }

  if (!log) return null;

  const formatDateTime = (iso: string) => {
    if (!iso) return "N/A";
    const d = new Date(iso);
    return `${d.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })} | ${d.toLocaleDateString("en-US", { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "UPDATE": case "SET_IMMUTABLE": return "text-[#F59E0B]";
      case "CREATE": case "SEED_DATA": return "text-[#00C853]";
      case "DELETE": return "text-[#F04438]";
      default: return "text-slate-700";
    }
  };

  // حماية المتغيرات لو الباك إند بعتها فاضية
  const safeCategory = log.category || "System";
  const safeAction = log.action || "Action";
  const safeUsername = log.actorUsername || "System";
  const metadata: AuditMetadata | undefined = log.metadata;
  const metadataTitle = metadata?.title?.trim();
  const metadataDescription = metadata?.description?.trim();
  const metadataKeys = metadata?.keys ?? [];
  const title = metadataTitle || `${safeCategory} ${safeAction} By ${safeUsername}`;

  return (
    <div className="w-full animate-in fade-in duration-300 pb-20 bg-white min-h-screen">
      
      {/* ─── TOP HEADER ─── */}
      <div className="bg-white w-full border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 sticky top-0 z-20">
        <div className="text-[11px] font-mono tracking-widest mb-4 text-gray-400 uppercase flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <Link href="/admin/audit-log" className="hover:text-gray-600 transition-colors">Audit Log</Link>
          <span>/</span>
          <span className="text-[#175FFF] font-bold truncate max-w-[220px]">{title}</span>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center w-full">
          <div className="min-w-0">
            <h1 className="font-bold text-[18px] text-slate-800 tracking-tight">{title}</h1>
            <div className="text-[12px] font-mono text-slate-400 mt-1 flex items-center gap-1 min-w-0">
              Entity: {safeCategory} [{log.entityId || "N/A"}] <ExternalLink size={12} className="ml-1" />
            </div>
          </div>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2 sm:gap-3">
            <Link href="/admin/audit-log" className="w-full sm:w-auto flex items-center justify-center bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-700 font-mono text-[13px] font-bold h-[38px] px-5 rounded-[4px] transition-colors">
              <ArrowLeft size={16} className="mr-2" strokeWidth={2.5} /> Back
            </Link>
            <button 
              onClick={handleDelete}
              disabled={isDeleting || !isSuperAdmin}
              className="w-full sm:w-auto flex items-center justify-center bg-[#F04438] hover:bg-red-600 text-white font-mono text-[13px] font-bold h-[38px] px-6 rounded-[4px] transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" strokeWidth={2.5} />} 
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="bg-white border border-gray-200 shadow-sm w-full rounded-[4px] p-4 sm:p-6 lg:p-8 space-y-8 font-mono">
          
          {/* Action & Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Action</label>
              <div className={`text-[13px] font-bold ${getActionColor(log.action)}`}>{safeAction}</div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Method</label>
              <div className="text-[13px] font-bold text-slate-700">{log.httpMethod || "N/A"}</div>
            </div>
          </div>

          {/* User Info */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">User</label>
            <div className="text-[13px] font-bold text-slate-800">{safeUsername}</div>
            <div className="text-[12px] text-slate-500 mt-1">Email: {log.actorEmail || "N/A"}</div>
            <div className="text-[12px] text-slate-500 mt-1">IP Address: {log.ipAddress || "N/A"}</div>
            <div className="text-[12px] mt-1 text-slate-500">
              Role: <span className={log.actorRole === "SUPER_ADMIN" ? "text-[#F04438] font-bold" : "text-[#175FFF] font-bold"}>{log.actorRole?.replace("_", " ") || "N/A"}</span>
            </div>
          </div>

          {/* Entity & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Entity</label>
              <div className="text-[13px] text-slate-700 font-bold capitalize flex items-center gap-2">
                {/* هنا تم حل المشكلة بـ ?. */}
                {log.category?.toLowerCase() || "system"}: {log.entityId || "N/A"} <ExternalLink size={14} className="text-slate-400" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Date & Time</label>
              <div className="text-[13px] font-bold text-slate-700">{formatDateTime(log.createdAt)}</div>
            </div>
          </div>

          {/* Updated Fields */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Updated Fields</label>
            {metadataKeys.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {metadataKeys.map((key) => (
                  <span key={key} className="rounded-[4px] border border-gray-200 bg-[#F8FAFC] px-2 py-1 text-[12px] text-slate-700">
                    {key}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-500">No updated fields.</p>
            )}
          </div>

          {/* Metadata */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Metadata</label>
            <div className="bg-[#F1F5F9] rounded-[4px] p-4 overflow-x-auto border border-gray-200">
              <div className="space-y-3 text-[12px] text-slate-700">
                <p>
                  <span className="font-bold">Title:</span>{" "}
                  {metadataTitle || "N/A"}
                </p>
                <p>
                  <span className="font-bold">Description:</span>{" "}
                  {metadataDescription || "N/A"}
                </p>
                <pre className="whitespace-pre-wrap leading-relaxed text-slate-600">
                  {metadata && Object.keys(metadata).length > 0
                    ? JSON.stringify(metadata, null, 2)
                    : "No metadata available for this action."}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}