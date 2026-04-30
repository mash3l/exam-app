import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center gap-4 bg-white px-6">
      <p className="text-sm font-mono text-slate-500">404</p>
      <h1 className="text-2xl font-bold text-slate-900">الصفحة غير موجودة</h1>
      <p className="max-w-md text-center text-sm text-slate-600">
        الرابط غير صحيح أو تمت إزالة الصفحة.
      </p>
      <Link
        href="/diplomas"
        className="rounded-none bg-[#175FFF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        العودة للدبلومات
      </Link>
    </div>
  );
}
