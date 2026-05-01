"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Search, ChevronsUpDown, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import type { Exam } from "@/types/models";
import type { AppSession } from "@/types/auth";

import { AdminFilterBox } from "./AdminFilterBox";
import { AdminSortDropdown } from "./AdminSortDropdown";
import { AdminActionDropdown } from "./AdminActionDropdown";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

type AdminExamTableProps = {
  exams?: Exam[];
  children?: ReactNode;
};

export default function AdminExamTable({ exams: initialExams = [], children }: AdminExamTableProps) {
  const { data: session } = useSession();
  const typedSession = session as AppSession | null;
  const token = typedSession?.accessToken;
  const router = useRouter();

  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [isLoading, setIsLoading] = useState(true);

  // جلب بيانات الامتحانات
  useEffect(() => {
    if (!token || initialExams.length > 0) {
      setIsLoading(false);
      return;
    }

    async function fetchExams() {
      try {
        const res = await fetch(`${BASE_URL}/api/exams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const responseData = await res.json();

        if (res.ok) {
          const responsePayload = responseData.payload?.exams || responseData.payload?.data || responseData.payload || [];
          const actualExamsArray: Exam[] = Array.isArray(responsePayload) ? responsePayload : [];
          setExams(actualExamsArray);
        } else {
          toast.error("Failed to load exams");
        }
      } catch {
        toast.error("A network error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchExams();
  }, [token, initialExams]);

  return (
    <div className="w-full animate-in fade-in duration-300 pb-10">

      {/* 1. الهيدر - متظبط 100% ريسبونسف */}
      <div className="bg-white w-full border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col gap-4">
          
          <h1 className="text-[12px] text-slate-400 font-mono tracking-wide m-0 uppercase font-bold">
            Exams
          </h1>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full gap-4 lg:gap-0">
            
            {/* الجزء اللي على الشمال: النصوص وأرقام الصفحات */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full lg:w-auto">
              <span className="text-[14px] font-mono text-slate-800 font-medium whitespace-nowrap">
                1 - 20 of 548
              </span>

              {/* أزرار التقليب المتصلة - ريسبونسف */}
              <div className="flex items-center shadow-sm rounded-[4px] w-full sm:w-auto">
                <button className="w-12 sm:w-10 h-10 flex items-center justify-center bg-[#E2E8F0] text-slate-400 hover:bg-[#CBD5E1] transition-colors rounded-l-[4px] cursor-pointer shrink-0">
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
                
                <div className="h-10 px-4 flex-1 sm:flex-none flex items-center justify-center bg-white border-y border-gray-200 text-[13px] font-mono text-slate-400 whitespace-nowrap">
                  Page 1 of 28
                </div>
                
                <button className="w-12 sm:w-10 h-10 flex items-center justify-center bg-[#E2E8F0] text-slate-800 hover:bg-[#CBD5E1] transition-colors rounded-r-[4px] cursor-pointer shrink-0">
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* الجزء اللي على اليمين: زرار الإضافة */}
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

      {/* 2. الفلاتر والجدول */}
      <div className="p-4 sm:p-6 lg:p-8 pt-6 space-y-5">
        
        <AdminFilterBox>
          <div className="space-y-3 md:space-y-4">
            {/* بحث */}
            <div className="relative">
              <Input
                placeholder="Search by title..."
                className="rounded-[4px] border-gray-200 font-mono text-[13px] h-10 pl-3 pr-10 focus-visible:ring-blue-500"
              />
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>

            {/* قوائم الفلترة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <select className="h-10 w-full border border-gray-200 bg-white px-3 font-mono text-[13px] text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-[4px] appearance-none cursor-pointer">
                  <option value="">Diploma</option>
                  <option value="full-stack">Full Stack Development</option>
                  <option value="data-science">Data Science</option>
                </select>
                <ChevronsUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select className="h-10 w-full border border-gray-200 bg-white px-3 font-mono text-[13px] text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-[4px] appearance-none cursor-pointer">
                  <option value="">Immutability</option>
                  <option value="true">Immutable</option>
                  <option value="false">Mutable</option>
                </select>
                <ChevronsUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* زراير الفلتر */}
            <div className="flex justify-end gap-2 pt-1 w-full sm:w-auto">
              <Button variant="ghost" className="flex-1 sm:flex-none rounded-[4px] font-mono text-[12px] font-bold text-gray-500 hover:bg-gray-100 h-9 px-5 cursor-pointer transition-colors">
                Clear
              </Button>
              <Button className="flex-1 sm:flex-none rounded-[4px] font-mono text-[12px] font-bold bg-[#E2E8F0] text-slate-700 hover:bg-slate-300 h-9 px-5 shadow-none cursor-pointer transition-colors">
                Apply
              </Button>
            </div>
          </div>
        </AdminFilterBox>

        {/* Data Table */}
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
                {exams.map((exam: Exam) => {
                  const rowId = exam._id || exam.id;
                  return (
                    <article key={rowId} className="p-4 space-y-3">
                      <button
                        type="button"
                        onClick={() => rowId && router.push(`/admin/exams/${rowId}`)}
                        className="w-full text-left flex items-start gap-3 cursor-pointer"
                      >
                        <img
                          src={exam.image || exam.imgURL || "https://placehold.co/100"}
                          alt={exam.title || "Exam"}
                          className="w-12 h-12 object-cover shadow-sm border border-gray-100 rounded-[4px] shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100/1E293B/FFF?text=Error"; }}
                        />
                        <div className="min-w-0">
                          <p className="font-mono text-[13px] text-slate-800 font-bold line-clamp-2">
                            {exam.title || exam.name}
                          </p>
                          <p className="font-mono text-[12px] text-slate-500 line-clamp-1 mt-1">
                            {exam.diploma?.title || exam.diplomaName || "Full Stack Development"}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[12px] text-slate-500">
                          Questions: {exam.questionsCount || exam.numberOfQuestions || "10"}
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
                        <AdminSortDropdown />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px]">
                    {exams.map((exam: Exam) => {
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
                            <img
                              src={exam.image || exam.imgURL || "https://placehold.co/100"}
                              alt={exam.title || "Exam"}
                              className="w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] object-cover shadow-sm border border-gray-100 rounded-[4px]"
                              onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100/1E293B/FFF?text=Error"; }}
                            />
                          </td>
                          <td className="px-5 py-3 font-bold text-slate-800">
                            <span className="line-clamp-2">{exam.title || exam.name}</span>
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            <span className="line-clamp-1">
                              {exam.diploma?.title || exam.diplomaName || "Full Stack Development"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            <span className="px-2 py-1 rounded-md text-slate-600 font-bold">
                              {exam.questionsCount || exam.numberOfQuestions || "10"}
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