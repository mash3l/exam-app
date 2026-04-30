"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, XCircle } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { loginBodySchema } from "@/features/auth/schemas/auth.schema";
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

export type LoginFormValues = z.infer<typeof loginBodySchema>;

type LoginFormProps = {
  onValidatedSubmit?: (values: LoginFormValues) => void | Promise<void>;
  submitDisabled?: boolean;
};

export function LoginForm({ onValidatedSubmit, submitDisabled = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginBodySchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    form.clearErrors("root");
    await onValidatedSubmit?.(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-slate-700">Email or username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="username"
                  placeholder="name@example.com"
                  className="h-11 rounded-none bg-white text-gray-700 focus-visible:ring-offset-0 [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-slate-700">Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-11 rounded-none bg-white text-gray-700 focus-visible:ring-offset-0 pr-10 [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <FormMessage />
              <div className="flex justify-end pt-2">
                <Link href="/forgot-password" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">
                  Forgot your password?
                </Link>
              </div>
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <div className="relative mt-6 rounded-none border border-red-500 bg-[#FFF5F5] py-3 text-center">
            <div className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-white px-1">
              <XCircle className="w-4 h-4 text-red-500" strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold text-red-500">{String(form.formState.errors.root.message)}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitDisabled || form.formState.isSubmitting}
          className="w-full h-12 rounded-none bg-[#175FFF] hover:bg-blue-700 text-white font-semibold mt-4 cursor-pointer disabled:opacity-70"
        >
          {form.formState.isSubmitting ? "Logging in…" : "Login"}
        </Button>
      </form>
    </Form>
  );
}