"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react"; 
import { LoginForm, type LoginFormValues } from "@/features/auth/components/LoginForm";

const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (!skipAuth) return;
    void signIn("credentials", {
      email: "",
      password: "",
      callbackUrl: "/diplomas",
      redirect: true,
    });
  }, []);

  if (skipAuth) {
    return (
      <div className="mx-auto w-full max-w-[380px] py-16 text-center text-sm font-medium text-slate-600">
        جاري فتح التطبيق بدون تسجيل دخول يدوي (وضع التطوير)…
      </div>
    );
  }

  async function handleValidatedSubmit(values: LoginFormValues) {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setErrorMessage("");
    
    try {
      const result = await signIn("credentials", {
        email: values.username,
        password: values.password,
        redirect: false, // قفلنا التوجيه التلقائي عشان نعمله إحنا تحت
      });
      
      if (result?.error) {
        setErrorMessage(
          "Sign-in failed. Please check your email and password and try again."
        );
        return;
      }
      
      if (result?.ok) {
        // بنسحب السيشن عشان نعرف الرتبة اللي رجعت
        const session = await getSession();
        
        console.log("🔥 MY CURRENT SESSION:", session);

        const userRole = (session?.user as any)?.role;

        // التوجيه الذكي بناءً على الرتبة
        if (userRole === "ADMIN" || userRole === "admin" || userRole === "SUPER_ADMIN" || userRole === "superAdmin") {
          router.push("/admin/diplomas");
        } else {
          router.push("/diplomas"); 
        }
        
        // ريفريش سريع عشان السايد بار يحس بالسيشن الجديدة ويغير لونه
        router.refresh();
      }
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[380px] flex-col">
      <div className="mb-10">
        <h2 className="text-[32px] font-bold tracking-tight text-slate-900">Login</h2>
      </div>

      {errorMessage ? (
        <p className="mb-4 text-center text-[11px] font-bold text-red-500 bg-red-50 py-2 border border-red-100 rounded-sm" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <LoginForm
        onValidatedSubmit={handleValidatedSubmit}
        submitDisabled={isAuthenticating}
      />

      <div className="mt-8 text-center text-xs font-medium text-gray-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="cursor-pointer font-bold text-[#175FFF] hover:underline">
          Create yours
        </Link>
      </div>
    </div>
  );
}