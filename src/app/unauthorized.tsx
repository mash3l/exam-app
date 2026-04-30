import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center gap-4 bg-white px-6">
      <p className="text-sm font-mono text-[#175FFF]">401</p>
      <h1 className="text-2xl font-bold text-slate-900">يجب تسجيل الدخول</h1>
      <p className="max-w-md text-center text-sm text-slate-600">
        هذه الصفحة متاحة للمستخدمين المسجلين فقط.
      </p>
      <Link
        href="/login"
        className="rounded-none bg-[#175FFF] px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        تسجيل الدخول
      </Link>
    </div>
  );
}
