"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { changePasswordBodySchema } from "@/features/account/schemas/account.schema";
import { clientApiUrl } from "@/lib/client-api";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { toast } from "sonner";

type PasswordFormValues = z.infer<typeof changePasswordBodySchema>;

export default function PasswordPage() {
  const { status } = useSession();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(changePasswordBodySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: PasswordFormValues) {
    if (status !== "authenticated") {
      toast.error("You must be logged in to change your password.");
      return;
    }

    try {
      const res = await fetch(clientApiUrl("/api/users/change-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          confirmPassword: values.confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(
          data?.message ||
            data?.error ||
            "Failed to update password. Check your current password.",
          { richColors: true }
        );
        return;
      }

      toast.success("Your password has been updated successfully!", {
        richColors: true,
      });

      await signOut({ callbackUrl: "/login?passwordChanged=1" });
    } catch {
      toast.error("A network error occurred. Please try again.", {
        richColors: true,
      });
    }
  }

  return (
    <div className="max-w-[600px] space-y-8 animate-in fade-in duration-300">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-bold font-mono text-slate-800">
                  Current Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      type={showCurrent ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-14 rounded-none border-gray-200 bg-white pr-12 font-mono shadow-sm focus-visible:ring-blue-500"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300 hover:text-gray-500"
                  >
                    {showCurrent ? (
                      <Eye size={18} strokeWidth={2} />
                    ) : (
                      <EyeOff size={18} strokeWidth={2} />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[13px] font-bold font-mono text-slate-800">
                  New Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-14 rounded-none border-gray-200 bg-white pr-12 font-mono shadow-sm focus-visible:ring-blue-500"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300 hover:text-gray-500"
                  >
                    {showNew ? (
                      <Eye size={18} strokeWidth={2} />
                    ) : (
                      <EyeOff size={18} strokeWidth={2} />
                    )}
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
                <FormLabel className="text-[13px] font-bold font-mono text-slate-800">
                  Confirm New Password
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-14 rounded-none border-gray-200 bg-white pr-12 font-mono shadow-sm focus-visible:ring-blue-500"
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-300 hover:text-gray-500"
                  >
                    {showConfirm ? (
                      <Eye size={18} strokeWidth={2} />
                    ) : (
                      <EyeOff size={18} strokeWidth={2} />
                    )}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="h-14 w-full flex justify-center items-center gap-2 rounded-none bg-[#175FFF] font-mono text-[14px] font-bold text-white shadow-sm hover:bg-blue-700"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
