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
  const session = await getServerSession(authOptions);

  return (
    /* 
      1. الـ Root واخد h-screen و overflow-hidden عشان يثبت الشاشة كلها 
      وده هيخلي السايد بار يتسمر في مكانه من غير ما يتهز 
    */
    <div className="flex h-screen w-full overflow-hidden bg-[#ffffff]" dir="ltr">
      
      {/* السايد بار */}
      <Sidebar session={session} />
      
      {/* 2. العمود اللي على اليمين (الهيدر + المحتوى) */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Header />
        
        {/* 3. المحتوى نفسه هو الوحيد اللي بيعمل سكرول (overflow-y-auto) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
        
        <Toaster richColors position="bottom-right" />
      </div>

    </div>
  );
}