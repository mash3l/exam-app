import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { Sidebar } from "@/shared/components/Sidebar";
import { Header } from "@/shared/components/Header";
import { Toaster } from "sonner";

export default async function AdminProtectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  // تعديل الحماية: لو مش أدمن يروح لصفحة تسجيل الدخول أو صفحة عامة
  // ولو هو أدمن وداخل على /admin نخليه يروح لجدول الامتحانات فوراً
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full items-start bg-[#ffffff]" dir="ltr">
      <Sidebar session={session} />

      <div className="relative flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 xl:p-8">
          {children}
        </main>
        <Toaster richColors position="bottom-right" />
      </div>
    </div>
  );
}