import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { Sidebar } from "@/shared/components/Sidebar";
import { Header } from "@/shared/components/Header";
import { Toaster } from "sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // جلب بيانات الجلسة من السيرفر مباشرة لسرعة الرندر
  const session = await getServerSession(authOptions);

  return (
    <div className="flex h-screen w-full bg-[#F4F8FF] overflow-hidden" dir="ltr">
      
      {/* تمرير السيشن مباشرة للسايد بار لمنع الرمشة نهائياً */}
      <Sidebar session={session} />

      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

        <Toaster richColors position="bottom-right" />
      </div>
    </div>
  );
}