"use client";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { AdminFilterBox } from "@/features/admin/components/AdminFilterBox";
import type { Diploma } from "@/types/models";
import { ChevronsUpDown } from "lucide-react";

type AdminExamFiltersProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  diplomaId: string;
  setDiplomaId: (value: string) => void;
  diplomas: Diploma[];
  onApply: () => void;
  onClear: () => void;
};

export function AdminExamFilters({
  searchQuery,
  setSearchQuery,
  diplomaId,
  setDiplomaId,
  diplomas,
  onApply,
  onClear,
}: AdminExamFiltersProps) {
  return (
    <AdminFilterBox>
      <div className="space-y-3 md:space-y-4">
        <div>
          <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase mb-2">
            Search
          </label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title"
            className="rounded-[4px] border-gray-200 font-mono text-[13px] h-10"
          />
        </div>

        <div className="relative">
          <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase mb-2">
            Diploma
          </label>
          <select
            value={diplomaId}
            onChange={(e) => setDiplomaId(e.target.value)}
            className="h-10 w-full border border-gray-200 bg-white px-3 font-mono text-[13px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-[4px] appearance-none cursor-pointer"
          >
            <option value="">All diplomas</option>
            {diplomas.map((diploma) => {
              const id = diploma.id ?? diploma._id ?? "";
              return (
                <option key={id} value={id}>
                  {diploma.title}
                </option>
              );
            })}
          </select>
          <ChevronsUpDown size={14} className="absolute right-3 bottom-3 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex justify-end gap-2 pt-1 w-full sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="flex-1 sm:flex-none rounded-[4px] font-mono text-[12px] font-bold text-gray-500 hover:bg-gray-100 h-9 px-5"
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={onApply}
            className="flex-1 sm:flex-none rounded-[4px] font-mono text-[12px] font-bold bg-[#E2E8F0] text-slate-700 hover:bg-slate-300 h-9 px-5 shadow-none"
          >
            Apply
          </Button>
        </div>
      </div>
    </AdminFilterBox>
  );
}
