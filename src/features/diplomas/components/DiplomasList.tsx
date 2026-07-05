"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, AlertCircle } from "lucide-react";
import { DiplomaCard } from "@/features/diplomas/components/DiplomaCard";
import type { Diploma, DiplomasResponse } from "@/features/diplomas/types";
import { api } from "@/lib/axios";

function unwrapDiplomasResponse(data: unknown): DiplomasResponse {
  const root = data as Record<string, unknown>;
  const payload = (root.payload ?? root) as Record<string, unknown>;
  const list = (payload.data ?? payload) as Diploma[];
  const pagination = (payload.pagination ?? root.pagination) as DiplomasResponse["pagination"];

  return {
    data: Array.isArray(list) ? list : [],
    pagination: pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 },
  };
}

export function DiplomasList() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["diplomas", "infinite"],
      queryFn: async ({ pageParam = 1 }) => {
        const response = await api.get("/api/diplomas", {
          params: { page: pageParam, limit: 20 },
        });
        return unwrapDiplomasResponse(response.data);
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.pagination;
        return page < totalPages ? page + 1 : undefined;
      },
    });

  const diplomas =
    data?.pages.flatMap((page) => page.data).filter((d): d is Diploma => Boolean(d)) ?? [];

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(handleObserver, { rootMargin: "200px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [handleObserver]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="w-full h-[320px] bg-slate-200/50 animate-pulse border border-gray-100"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center mt-32">
        <AlertCircle className="w-16 h-16 text-[#F04438] mb-4" />
        <h2 className="text-xl font-bold text-slate-800 font-mono tracking-tight">
          Oops! Something went wrong
        </h2>
        <p className="text-slate-500 mt-2 font-mono text-[13px]">Failed to load diplomas.</p>
      </div>
    );
  }

  if (diplomas.length === 0) {
    return (
      <div className="col-span-3 text-center text-slate-500 py-10 font-mono">
        No diplomas found on the server.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diplomas.map((diploma) => {
          const rowId = diploma.id ?? diploma._id;
          if (!rowId) return null;
          return (
            <DiplomaCard
              key={rowId}
              id={rowId}
              title={diploma.title}
              description={diploma.description}
              image={diploma.image}
            />
          );
        })}
      </div>

      <div ref={sentinelRef} className="flex flex-col items-center justify-center gap-1 text-gray-500 mt-12 mb-8 min-h-[48px]">
        {isFetchingNextPage ? (
          <span className="text-[12px] font-mono tracking-wide">Loading more...</span>
        ) : hasNextPage ? (
          <>
            <span className="text-[12px] font-mono tracking-wide">Scroll to view more</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </>
        ) : (
          <span className="text-[12px] font-mono tracking-wide uppercase">End of list</span>
        )}
      </div>
    </>
  );
}
