import Link from "next/link";
import { ExternalLink, MoreHorizontal, Eye, Trash2, Loader2, Filter } from "lucide-react";
import { AuditLog } from "@/types/audit"; // تأكد إن ملف الـ types موجود في مكانه

type AuditLogTableProps = {
  logs: AuditLog[];
  isLoading: boolean;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
};

export function AuditLogTable({ logs, isLoading, activeDropdown, setActiveDropdown, onDelete, canDelete }: AuditLogTableProps) {
  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString("en-US", { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

  const getActionColor = (action: string) => {
    switch (action) {
      case "UPDATE": case "SET_IMMUTABLE": return "text-[#F59E0B]";
      case "CREATE": case "SEED_DATA": return "text-[#00C853]";
      case "DELETE": return "text-[#F04438]";
      default: return "text-slate-700";
    }
  };

  const getRoleColor = (role: string) => role === "SUPER_ADMIN" ? "text-[#F04438]" : "text-[#175FFF]";

  return (
    <div className="bg-white border border-gray-200 shadow-sm w-full rounded-[4px] overflow-visible md:overflow-hidden min-h-[400px]">
      <div className="hidden md:flex bg-[#175FFF] items-center h-[46px] px-4 sm:px-6 text-white font-mono text-[12px] font-bold tracking-wider min-w-[900px]">
        <div className="w-[15%]">Action</div>
        <div className="w-[25%]">User</div>
        <div className="w-[35%]">Entity</div>
        <div className="w-[20%]">Time</div>
        <div className="w-[5%] flex justify-end"></div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#175FFF] animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 font-mono text-[13px]">
          <Filter size={32} className="mb-3 text-slate-300" />
          No audit logs found.
        </div>
      ) : (
        <>
          <div className="md:hidden divide-y divide-gray-100 bg-white pb-2">
            {logs.map((log) => (
              <article key={log.id} className="p-4 space-y-3 relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`text-[13px] font-bold font-mono ${getActionColor(log.action)}`}>{log.action}</div>
                    <div className="text-[11px] font-mono text-slate-400 mt-1 uppercase">Method: {log.httpMethod}</div>
                  </div>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === log.id ? null : log.id)}
                    className="w-8 h-8 flex items-center justify-center bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-500 rounded-[4px] transition-colors shrink-0"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <div className="font-mono">
                  <div className="text-[13px] font-bold text-slate-800 line-clamp-1">{log.actorUsername || "System"}</div>
                  <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{log.actorEmail}</div>
                  <div className={`text-[11px] font-bold mt-1 ${getRoleColor(log.actorRole)}`}>{log.actorRole?.replace("_", " ")}</div>
                </div>

                <div className="font-mono">
                  <div className="text-[12px] font-bold text-slate-800 uppercase">{log.category}</div>
                  {log.entityId && (
                    <Link href={`/admin/audit-log/${log.id}`} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#175FFF] mt-1 transition-colors line-clamp-1 w-fit" title={log.entityId}>
                      {log.entityId.slice(0, 18)}... <ExternalLink size={12} className="shrink-0" />
                    </Link>
                  )}
                </div>

                <div className="font-mono text-[12px] text-slate-700">
                  {formatTime(log.createdAt)} <span className="text-slate-500">- {formatDate(log.createdAt)}</span>
                </div>

                {activeDropdown === log.id && (
                  <div className="absolute right-4 top-11 bg-white border border-gray-200 shadow-lg rounded-[4px] w-[140px] z-20 py-1 overflow-hidden font-mono">
                    <Link href={`/admin/audit-log/${log.id}`} className="w-full flex items-center px-4 py-2.5 text-[12px] font-bold text-[#00C853] hover:bg-white transition-colors">
                      <Eye size={14} className="mr-2" strokeWidth={2.5} /> View
                    </Link>
                    <button
                      onClick={() => onDelete(log.id)}
                      disabled={!canDelete}
                      className="w-full flex items-center px-4 py-2.5 text-[12px] font-bold text-[#F04438] hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} className="mr-2" strokeWidth={2.5} /> Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <div className="divide-y divide-gray-100 bg-white pb-4 min-w-[900px]">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start px-4 sm:px-6 py-4 hover:bg-white transition-colors relative">
                  <div className="w-[15%] font-mono">
                    <div className={`text-[13px] font-bold ${getActionColor(log.action)}`}>{log.action}</div>
                    <div className="text-[11px] text-slate-400 mt-1 uppercase">Method: {log.httpMethod}</div>
                  </div>

                  <div className="w-[25%] font-mono pr-4">
                    <div className="text-[13px] font-bold text-slate-800 line-clamp-1">{log.actorUsername || "System"}</div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">{log.actorEmail}</div>
                    <div className={`text-[11px] font-bold mt-1 ${getRoleColor(log.actorRole)}`}>{log.actorRole?.replace("_", " ")}</div>
                  </div>

                  <div className="w-[35%] font-mono pr-4">
                    <div className="text-[13px] font-bold text-slate-800 uppercase">{log.category}</div>
                    {log.entityId && (
                      <Link href={`/admin/audit-log/${log.id}`} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#175FFF] mt-1 transition-colors line-clamp-1 w-fit" title={log.entityId}>
                        {log.entityId.slice(0, 18)}... <ExternalLink size={12} className="shrink-0" />
                      </Link>
                    )}
                  </div>

                  <div className="w-[20%] font-mono">
                    <div className="text-[13px] font-bold text-slate-800">{formatTime(log.createdAt)}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{formatDate(log.createdAt)}</div>
                  </div>

                  <div className="w-[5%] flex justify-end sticky right-0 bg-white">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === log.id ? null : log.id)}
                      className="w-8 h-8 flex items-center justify-center bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-500 rounded-[4px] transition-colors"
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {activeDropdown === log.id && (
                      <div className="absolute right-12 top-10 bg-white border border-gray-200 shadow-lg rounded-[4px] w-[140px] z-10 py-1 overflow-hidden font-mono">
                        <Link href={`/admin/audit-log/${log.id}`} className="w-full flex items-center px-4 py-2.5 text-[12px] font-bold text-[#00C853] hover:bg-white transition-colors">
                          <Eye size={14} className="mr-2" strokeWidth={2.5} /> View
                        </Link>
                        <button
                          onClick={() => onDelete(log.id)}
                          disabled={!canDelete}
                          className="w-full flex items-center px-4 py-2.5 text-[12px] font-bold text-[#F04438] hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 size={14} className="mr-2" strokeWidth={2.5} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}