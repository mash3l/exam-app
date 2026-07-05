"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/ui/button";
import { clientApiUrl } from "@/lib/client-api";
import type { Diploma, Exam } from "@/types/models";
import { AdminExamTable } from "@/features/admin/components/AdminExamTable";
import { AdminExamFilters } from "@/features/admin/components/AdminExamFilters";

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function ExamsAdminPage() {
  const { status } = useSession();

  const [exams, setExams] = useState<Exam[]>([]);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [metadata, setMetadata] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [diplomaId, setDiplomaId] = useState("");
  const [appliedDiplomaId, setAppliedDiplomaId] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "createdAt" | "questions">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchDiplomas() {
      try {
        const res = await fetch(clientApiUrl("/api/diplomas", "limit=100"));
        const data = await res.json();
        if (res.ok) {
          const list = data.payload?.data ?? data.payload ?? [];
          setDiplomas(Array.isArray(list) ? list : []);
        }
      } catch {
        // Non-blocking for exam list
      }
    }

    void fetchDiplomas();
  }, [status]);

  const fetchExams = useCallback(async () => {
    if (status !== "authenticated") return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sortBy,
        sortOrder,
      });
      if (appliedSearch.trim()) params.set("search", appliedSearch.trim());
      if (appliedDiplomaId) params.set("diplomaId", appliedDiplomaId);

      const res = await fetch(clientApiUrl("/api/exams", params));
      const data = (await res.json()) as {
        message?: string;
        payload?: { data?: Exam[]; exams?: Exam[]; pagination?: PaginationMeta };
      };

      if (res.ok) {
        const list = data.payload?.data ?? data.payload?.exams ?? [];
        setExams(Array.isArray(list) ? list : []);
        setMetadata(
          data.payload?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 }
        );
      } else {
        toast.error(data.message || "Failed to load exams");
      }
    } catch {
      toast.error("Network error while fetching exams");
    } finally {
      setIsLoading(false);
    }
  }, [status, page, appliedSearch, appliedDiplomaId, sortBy, sortOrder]);

  useEffect(() => {
    void fetchExams();
  }, [fetchExams]);

  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setAppliedDiplomaId(diplomaId);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDiplomaId("");
    setAppliedSearch("");
    setAppliedDiplomaId("");
    setPage(1);
  };

  const handleSortChange = (
    nextSortBy: "title" | "createdAt" | "questions",
    nextSortOrder: "asc" | "desc"
  ) => {
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    setPage(1);
  };

  return (
    <div className="w-full">
      <AdminExamTable
        exams={exams}
        isLoading={isLoading}
        metadata={metadata}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        filters={
          <AdminExamFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            diplomaId={diplomaId}
            setDiplomaId={setDiplomaId}
            diplomas={diplomas}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        }
      >
        <Link href="/admin/exams/create">
          <Button
            variant="adminCta"
            size="admin-cta"
            className="font-mono rounded-[4px] shadow-none transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Add New Exam
          </Button>
        </Link>
      </AdminExamTable>
    </div>
  );
}
