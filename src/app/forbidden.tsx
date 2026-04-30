import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center gap-4 bg-white px-6">
      <p className="text-sm font-mono text-amber-600">403</p>
      <h1 className="text-2xl font-bold text-slate-900">غير مسموح</h1>
      <p className="max-w-md text-center text-sm text-slate-600">
        ليس لديك صلاحية للوصول إلى هذا المورد.
      </p>
      <Link
        href="/diplomas"
        className="rounded-none border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-800 hover:bg-white"
      >
        الرئيسية
      </Link>
    </div>
  );
}
