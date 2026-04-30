import { AuthBanner } from "@/features/auth/components/AuthBanner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // السر هنا في dir="ltr" عشان التصميم إنجليزي والـ flex يرص من الشمال لليمين
    <div className="flex min-h-screen w-full bg-white" dir="ltr">
      
      {/* الجزء الأول في الـ flex: هيظهر على الشمال (البانر) */}
      <div className="hidden w-1/2 lg:block">
        <AuthBanner />
      </div>

      {/* الجزء التاني في الـ flex: هيظهر على اليمين (الفورم) */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
      
    </div>
  );
}