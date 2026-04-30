"use client";

import { useState } from "react";
import Link from "next/link";
// ضفنا دول عشان نقرأ الـ Token من الرابط ونعمل Redirect للوجين
import { useSearchParams, useRouter } from "next/navigation"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPasswordResetFormSchema } from "@/features/auth/schemas/auth.schema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Eye, EyeOff, Loader2 } from "lucide-react"; // ضفت أيقونة تحميل

type NewPasswordValues = z.infer<typeof forgotPasswordResetFormSchema>;

export function NewPasswordStep() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  // هنجيب التوكن من الرابط، مثلاً: /reset-password?token=abcdef
  const token = searchParams?.get("token") || ""; 

  const form = useForm<NewPasswordValues>({
    resolver: zodResolver(forgotPasswordResetFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: NewPasswordValues) {
    if (!token) {
      form.setError("root", { message: "Invalid or missing token. Please request a new reset link." });
      return;
    }

    try {
      const res = await fetch("https://exam-app.elevate-bootcamp.cloud/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        form.setError("root", {
          message: data?.message || "Failed to reset password. Token might be expired.",
        });
        return;
      }

      // لو الباسورد اتغير بنجاح، ودي اليوزر يعمل لوجين بالباسورد الجديد
      router.push("/login?reset=success");

    } catch (error) {
      form.setError("root", { message: "An unexpected network error occurred." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
        <div className="mb-8">
          <h2 className="mb-2 text-[32px] font-bold tracking-tight text-slate-900">Create a New Password</h2>
          <p className="text-[13px] font-medium leading-relaxed text-gray-500">
            Create a new strong password for your account.
          </p>
        </div>

        {/* عرض أي إيرور جاي من الباك إند */}
        {form.formState.errors.root && (
          <p className="text-[13px] font-bold text-red-500 text-center bg-red-50 py-2">
            {form.formState.errors.root.message}
          </p>
        )}

        <div className="space-y-5">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-bold text-slate-700" htmlFor="newPassword">
                  New Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 rounded-none border-gray-200 bg-white pr-10 text-gray-700 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-bold text-slate-700" htmlFor="confirmPassword">
                  Confirm New Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-11 rounded-none border-gray-200 bg-white pr-10 text-gray-700 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="mt-6 h-12 w-full cursor-pointer rounded-none bg-[#175FFF] font-semibold text-white hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          {form.formState.isSubmitting ? (
             <><Loader2 className="animate-spin" size={18} /> Resetting...</>
          ) : (
            "Reset Password"
          )}
        </Button>

        <div className="mt-8 text-center text-xs font-medium text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="cursor-pointer font-bold text-blue-600 hover:underline">
            Create yours
          </Link>
        </div>
      </form>
    </Form>
  );
}