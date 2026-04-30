"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPasswordBodySchema } from "@/features/auth/schemas/auth.schema";
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
import { Loader2 } from "lucide-react"; // ضفنا أيقونة التحميل

type EmailStepValues = z.infer<typeof forgotPasswordBodySchema>;

interface EmailStepProps {
  nextStep: () => void;
  // لو حابب تمرر الإيميل لخطوة الـ Success عشان تعرضه هناك
  setEmail?: (email: string) => void; 
}

export function EmailStep({ nextStep, setEmail }: EmailStepProps) {
  const form = useForm<EmailStepValues>({
    resolver: zodResolver(forgotPasswordBodySchema),
    defaultValues: { email: "" },
  });

  // 🔥 الدالة الجديدة اللي بتكلم الـ API
  async function onSubmit(values: EmailStepValues) {
    try {
      // بنبعت الإيميل للباك إند
      const res = await fetch("https://exam-app.elevate-bootcamp.cloud/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // لو الإيميل مش موجود أو الباك إند رفض
        form.setError("root", {
          message: data?.message || data?.error || "Failed to send reset link. Please try again.",
        });
        return;
      }

      // لو اللينك اتبعت بنجاح
      console.log("Reset link sent successfully to:", values.email);
      if (setEmail) setEmail(values.email); // بنحفظ الإيميل لو محتاجينه
      nextStep(); // بننقل اليوزر لصفحة النجاح

    } catch (error) {
      form.setError("root", { message: "A network error occurred. Please try again later." });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
        <div className="mb-8">
          <h2 className="mb-2 text-[32px] font-bold tracking-tight text-slate-900">Forgot Password</h2>
          <p className="text-[13px] font-medium leading-relaxed text-gray-500">
            Don&apos;t worry, we will help you recover your account.
          </p>
        </div>

        {/* عرض أي إيرور جاي من السيرفر */}
        {form.formState.errors.root && (
          <p className="text-[13px] font-bold text-red-500 text-center bg-red-50 py-2">
            {form.formState.errors.root.message}
          </p>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-slate-700" htmlFor="email">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  className="h-11 rounded-none border-gray-200 bg-white text-gray-700 focus-visible:ring-blue-500 focus-visible:ring-offset-0 [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting}
          className="mt-4 h-12 w-full cursor-pointer rounded-none bg-[#175FFF] font-semibold text-white hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          {form.formState.isSubmitting ? (
             <><Loader2 className="animate-spin" size={18} /> Sending...</>
          ) : (
             "Next >"
          )}
        </Button>

        <div className="mt-8 text-xs font-medium text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="cursor-pointer font-bold text-blue-600 hover:underline">
            Create yours
          </Link>
        </div>
      </form>
    </Form>
  );
}