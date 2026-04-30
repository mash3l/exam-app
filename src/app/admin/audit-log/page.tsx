"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { AuditLog, Metadata } from "@/types/audit";
import { ClearLogsModal } from "@/shared/components/audit-log/ClearLogsModal";
import { AuditLogFilters } from "@/shared/components/audit-log/AuditLogFilters";
import { AuditLogTable } from "@/shared/components/audit-log/AuditLogTable";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

export default function AuditLogPage() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  // ─── STATES ───
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [metadata, setMetadata] = useState<Metadata>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Filters State
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ─── FETCH LOGS ───
  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ page: page.toString(), limit: "12" });
      if (category) queryParams.append("category", category);
      if (actionFilter) queryParams.append("action", actionFilter);
      if (searchQuery) queryParams.append("search", searchQuery);

      const res = await fetch(`${BASE_URL}/api/admin/audit-logs?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setLogs(data.payload?.data || []);
        setMetadata(data.payload?.metadata || { page: 1, limit: 12, total: 0, totalPages: 1 });
      } else {
        toast.error(data.message || "Failed to fetch audit logs");
      }
    } catch (error) {
      toast.error("Network error while fetching logs");
    } finally {
      setIsLoading(false);
    }
  }, [token, page, category, actionFilter, searchQuery]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // ─── HANDLERS ───
  const handleApplyFilters = () => { setPage(1); fetchLogs(); };
  const handleClearFilters = () => { setCategory(""); setActionFilter(""); setSearchQuery(""); setPage(1); };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log entry?")) return;
    setActiveDropdown(null);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/audit-logs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { toast.success("Entry deleted"); fetchLogs(); }
      else { toast.error("Failed to delete log"); }
    } catch (error) { toast.error("Network error"); }
  };

  const executeClearAllLogs = async () => {
    setIsClearing(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Cleared all audit logs`);
        setPage(1); fetchLogs(); setIsClearModalOpen(false);
      } else { toast.error("Failed to clear logs. Super Admin access required."); }
    } catch (error) { toast.error("Network error"); } finally { setIsClearing(false); }
  };

  // ─── RENDER ───
  return (
    <div className="w-full animate-in fade-in duration-300 pb-20 bg-white min-h-screen relative">
      
      <ClearLogsModal 
        isOpen={isClearModalOpen} 
        onClose={() => setIsClearModalOpen(false)} 
        onConfirm={executeClearAllLogs} 
        isClearing={isClearing} 
      />

      <div className="bg-white w-full border-b border-gray-200 px-8 py-5 sticky top-0 z-20">
        <div className="text-[11px] font-mono tracking-widest mb-4 text-gray-400 uppercase">
          <span className="text-[#175FFF] font-bold">Audit Log</span>
        </div>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[13px] font-bold text-slate-700">
              {metadata.total === 0 ? "0" : (metadata.page - 1) * metadata.limit + 1} - {Math.min(metadata.page * metadata.limit, metadata.total)} of {metadata.total}
            </span>
            <div className="flex items-center">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={metadata.page === 1} className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 border border-gray-200 border-r-0 rounded-l-[4px]">
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <div className="h-9 px-4 flex items-center justify-center bg-white border border-gray-200 font-mono text-[13px] text-slate-500">
                Page {metadata.page} of {metadata.totalPages || 1}
              </div>
              <button onClick={() => setPage(p => Math.min(metadata.totalPages, p + 1))} disabled={metadata.page === metadata.totalPages || metadata.totalPages === 0} className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 border border-gray-200 border-l-0 rounded-r-[4px]">
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          <button onClick={() => setIsClearModalOpen(true)} className="flex items-center justify-center bg-[#F04438] hover:bg-red-600 text-white font-mono text-[13px] font-bold h-9 px-6 rounded-[4px] transition-colors">
            <Trash2 size={16} className="mr-2.5" strokeWidth={2} /> Clear All Logs
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6 max-w-[1400px] mx-auto">
        <AuditLogFilters 
          isFiltersVisible={isFiltersVisible} setIsFiltersVisible={setIsFiltersVisible}
          category={category} setCategory={setCategory}
          actionFilter={actionFilter} setActionFilter={setActionFilter}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          onApply={handleApplyFilters} onClear={handleClearFilters}
        />

        <AuditLogTable 
          logs={logs} 
          isLoading={isLoading} 
          activeDropdown={activeDropdown} 
          setActiveDropdown={setActiveDropdown} 
          onDelete={handleDeleteLog} 
        />
      </div>
    </div>
  );
}