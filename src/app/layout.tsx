import ReactQueryProvider from "@/shared/providers/QueryProvider"
import { AuthSessionProvider } from "@/shared/providers/AuthSessionProvider"
import "./globals.css"
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils/tailwind-cn";
//   1. استيراد Toaster من Sonner  
import { Toaster } from "sonner";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ملاحظة: لو لوحة التحكم بالكامل إنجليزي، الأفضل تغير dir="ltr" و lang="en"
    <html lang="en" dir="ltr" className={cn("font-sans", geist.variable)}>
      <body className="antialiased bg-white text-slate-800 selection:bg-blue-100 cursor-default">        <AuthSessionProvider>
        <ReactQueryProvider>
          {children}


          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              className: 'font-mono text-[13px] cursor-default', // ظبطنا الفونت والماوس هنا
            }}
          />
        </ReactQueryProvider>
      </AuthSessionProvider>
      </body>
    </html>
  )
}
