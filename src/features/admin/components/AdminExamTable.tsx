"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { Exam } from "@/types/models";
import { AdminActionDropdown } from "./AdminActionDropdown";
import { AdminSortDropdown } from "./AdminSortDropdown";

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AdminExamTableProps = {
  exams: Exam[];
  isLoading?: boolean;
  metadata: PaginationMeta;
  onPageChange: (page: number) => void;
  sortBy: "title" | "createdAt" | "questions";
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: "title" | "createdAt" | "questions", sortOrder: "asc" | "desc") => void;
  filters?: ReactNode;
  children?: ReactNode;
};

export function AdminExamTable({
  exams,
  isLoading = false,
  metadata,
  onPageChange,
  sortBy,
  sortOrder,
  onSortChange,
  filters,
  children,
}: AdminExamTableProps) {
  const router = useRouter();
  const rangeStart = metadata.total === 0 ? 0 : (metadata.page - 1) * metadata.limit + 1;
  const rangeEnd = Math.min(metadata.page * metadata.limit, metadata.total);

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">
      <div className="bg-white w-full border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col gap-4">
          <h1 className="text-[12px] text-slate-400 font-mono tracking-wide m-0 uppercase font-bold">
            Exams
          </h1>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-4 lg:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full lg:w-auto">
              <span className="text-[14px] font-mono text-slate-800 font-medium whitespace-nowrap">
                {rangeStart} - {rangeEnd} of {metadata.total}
              </span>

              <div className="flex items-center shadow-sm rounded-[4px] w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onPageChange(Math.max(1, metadata.page - 1))}
                  disabled={metadata.page === 1}
                  className="w-12 sm:w-10 h-10 flex items-center justify-center bg-[#E2E8F0] text-slate-400 hover:bg-[#CBD5E1] transition-colors rounded-l-[4px] cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>

                <div className="h-10 px-4 flex-1 sm:flex-none flex items-center justify-center bg-white border-y border-gray-200 text-[13px] font-mono text-slate-400 whitespace-nowrap">
                  Page {metadata.page} of {metadata.totalPages || 1}
                </div>

                <button
                  type="button"
                  onClick={() => onPageChange(Math.min(metadata.totalPages, metadata.page + 1))}
                  disabled={metadata.page === metadata.totalPages || metadata.totalPages === 0}
                  className="w-12 sm:w-10 h-10 flex items-center justify-center bg-[#E2E8F0] text-slate-800 hover:bg-[#CBD5E1] transition-colors rounded-r-[4px] cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {children ? (
              <div className="w-full lg:w-auto">{children}</div>
            ) : (
              <Link href="/admin/exams/create" className="w-full lg:w-auto block">
                <Button className="bg-[#00C853] hover:bg-[#00A844] text-white font-mono text-[13px] font-bold h-[34px] px-5 rounded-none shadow-none transition-colors cursor-pointer">
                  <Plus size={16} className="mr-2" strokeWidth={2.5} /> Add New Exam
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 pt-6 space-y-5">
        {filters}

        <div className="bg-white border border-gray-200 shadow-sm relative z-0 min-h-[300px] rounded-[4px] overflow-visible md:overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
              <Loader2 className="animate-spin text-[#175FFF] w-8 h-8" />
            </div>
          ) : exams.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-mono text-[13px]">
              No exams found. Click &quot;Add New Exam&quot; to get started.
            </div>
          ) : (
            <>
              <div className="md:hidden divide-y divide-gray-100">
                {exams.map((exam) => {
                  const rowId = exam._id || exam.id;
                  return (
                    <article key={rowId} className="p-4 space-y-3">
                      <button
                        type="button"
                        onClick={() => rowId && router.push(`/admin/exams/${rowId}`)}
                        className="w-full text-left flex items-start gap-3 cursor-pointer"
                      >
                        <Image
                          src={exam.image || "https://placehold.co/100"}
                          alt={exam.title || "Exam"}
                          width={48}
                          height={48}
                          className="object-cover shadow-sm border border-gray-100 rounded-[4px] shrink-0"
                          unoptimized
                        />
                        <div className="min-w-0">
                          <p className="font-mono text-[13px] text-slate-800 font-bold line-clamp-2">
                            {exam.title}
                          </p>
                          <p className="font-mono text-[12px] text-slate-500 line-clamp-1 mt-1">
                            {exam.diploma?.title || exam.diplomaName || "—"}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[12px] text-slate-500">
                          Questions: {exam.questionsCount ?? exam.numberOfQuestions ?? 0}
                        </span>
                        <div onClick={(e) => e.stopPropagation()}>
                          <AdminActionDropdown id={rowId || ""} basePath="/admin/exams" />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden md:block w-full overflow-x-auto scrollbar-hide">
                <table className="w-full text-left font-mono min-w-[860px]">
                  <thead className="bg-[#175FFF] text-white uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-5 py-4 font-bold w-[80px]">Image</th>
                      <th className="px-5 py-4 font-bold w-[35%]">Title</th>
                      <th className="px-5 py-4 font-bold w-[25%]">Diploma</th>
                      <th className="px-5 py-4 font-bold w-[15%]">No. of Questions</th>
                      <th className="px-5 py-4 font-bold text-right sticky right-0 bg-[#175FFF] z-10">
                        <AdminSortDropdown
                          sortBy={sortBy === "questions" ? "createdAt" : sortBy}
                          sortOrder={sortOrder}
                          onChange={(nextSortBy, nextSortOrder) =>
                            onSortChange(nextSortBy, nextSortOrder)
                          }
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px]">
                    {exams.map((exam) => {
                      const rowId = exam._id || exam.id;
                      return (
                        <tr
                          key={rowId}
                          onClick={() => {
                            if (rowId) router.push(`/admin/exams/${rowId}`);
                          }}
                          className="border-b border-gray-100 hover:bg-slate-50 transition-colors group cursor-pointer"
                        >
                          <td className="px-5 py-3">
                            <Image
                              src={exam.image || "https://placehold.co/100"}
                              alt={exam.title || "Exam"}
                              width={48}
                              height={48}
                              className="object-cover shadow-sm border border-gray-100 rounded-[4px]"
                              unoptimized
                            />
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-800">
                            <span className="line-clamp-2">{exam.title}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            <span className="line-clamp-1">
                              {exam.diploma?.title || exam.diplomaName || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            <span className="px-2 py-1 rounded-md text-slate-600 font-bold">
                              {exam.questionsCount ?? exam.numberOfQuestions ?? 0}
                            </span>
                          </td>
                          <td
                            className="px-5 py-3 text-right sticky right-0 bg-white group-hover:bg-slate-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AdminActionDropdown id={rowId || ""} basePath="/admin/exams" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
