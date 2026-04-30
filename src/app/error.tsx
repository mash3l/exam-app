"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center gap-4 bg-[#F4F8FF] px-6">
      <h1 className="text-xl font-bold text-slate-900">حدث خطأ</h1>
      <p className="max-w-md text-center text-sm text-slate-600">
        تعذر إكمال الطلب. يمكنك المحاولة مرة أخرى.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-none bg-[#175FFF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
