"use client";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { AdminFilterBox } from "@/features/admin/components/AdminFilterBox";
import { useState } from "react";

type AdminDiplomaFiltersProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onApply: () => void;
  onClear: () => void;
};

export function AdminDiplomaFilters({
  searchQuery,
  setSearchQuery,
  onApply,
  onClear,
}: AdminDiplomaFiltersProps) {
  return (
    <AdminFilterBox>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-8">
          <label className="block text-[11px] font-mono font-bold text-slate-500 uppercase mb-2">
            Search
          </label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diplomas..."
            className="rounded-none border-gray-200 font-mono text-[13px] h-10"
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="flex-1 rounded-none font-mono text-[12px] h-10"
          >
            Clear
          </Button>
          <Button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-none bg-[#175FFF] hover:bg-blue-700 font-mono text-[12px] h-10"
          >
            Apply
          </Button>
        </div>
      </div>
    </AdminFilterBox>
  );
}
