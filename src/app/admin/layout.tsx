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
  // 1. نجيب السيشن من السيرفر
  const session = await getServerSession(authOptions);
  
  // 2. نقرأ الرتبة
  const userRole = (session?.user as any)?.role;

  // 3. الحماية: لو مش أدمن، ارميه بره
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    redirect("/diplomas");
  }

  // 4. لو أدمن، ارسمله السايد بار والهيدر والمحتوى
  return (
    <div className="flex h-screen w-full bg-[#F4F8FF] overflow-hidden" dir="ltr">
      
      {/* باصينا السيشن للسايد بار عشان يقرأ الداتا فوراً */}
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