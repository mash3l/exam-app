"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/shared/ui/button";
import { clientApiUrl } from "@/lib/client-api";
import type { Diploma } from "@/types/models";
import type { AppSession } from "@/types/auth";
import { AdminDiplomaTable } from "@/features/admin/components/AdminDiplomaTable";
import { AdminDiplomaFilters } from "@/features/admin/components/AdminDiplomaFilters";

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function DiplomasAdminPage() {
  const { status } = useSession();

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
  const [sortBy, setSortBy] = useState<"title" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchDiplomas = useCallback(async () => {
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

      const res = await fetch(clientApiUrl("/api/diplomas", params));
      const data = (await res.json()) as {
        message?: string;
        payload?: { data?: Diploma[]; pagination?: PaginationMeta };
      };

      if (res.ok) {
        setDiplomas(data.payload?.data ?? []);
        setMetadata(
          data.payload?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 }
        );
      } else {
        toast.error(data.message || "Failed to load diplomas");
      }
    } catch {
      toast.error("Network error while fetching diplomas");
    } finally {
      setIsLoading(false);
    }
  }, [status, page, appliedSearch, sortBy, sortOrder]);

  useEffect(() => {
    void fetchDiplomas();
  }, [fetchDiplomas]);

  const handleApplyFilters = () => {
    setAppliedSearch(searchQuery);
    setPage(1);
  };
  const handleClearFilters = () => {
    setSearchQuery("");
    setAppliedSearch("");
    setPage(1);
  };

  const handleSortChange = (nextSortBy: "title" | "createdAt", nextSortOrder: "asc" | "desc") => {
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    setPage(1);
  };

  return (
    <div className="w-full pt-4 px-4 md:px-8 pb-20">
      <AdminDiplomaTable
        diplomas={diplomas}
        isLoading={isLoading}
        metadata={metadata}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        filters={
          <AdminDiplomaFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        }
      >
        <Link href="/admin/diplomas/create">
          <Button
            variant="adminCta"
            size="admin-cta"
            className="font-mono rounded-[4px] shadow-none transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Add New Diploma
          </Button>
        </Link>
      </AdminDiplomaTable>
    </div>
  );
}
