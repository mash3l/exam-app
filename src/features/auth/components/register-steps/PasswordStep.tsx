"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerPasswordStepSchema } from "@/features/auth/schemas/auth.schema";
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
import { Eye, EyeOff } from "lucide-react";

type PasswordStepValues = z.infer<typeof registerPasswordStepSchema>;

interface Props {
  onPrev: () => void;
  onSubmit: (values: PasswordStepValues) => void | Promise<void>;
}

export function PasswordStep({ onPrev, onSubmit }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordStepValues>({
    resolver: zodResolver(registerPasswordStepSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values);
        })}
        className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Create a strong password</h3>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-bold text-slate-700" htmlFor="newPassword">
                Password
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
                Confirm Password
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

        <Button type="submit" className="mt-4 h-12 w-full cursor-pointer rounded-none bg-[#175FFF] font-semibold text-white hover:bg-blue-700">
          Create Account
        </Button>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onPrev}
            className="cursor-pointer text-xs font-bold text-gray-400 transition-colors hover:text-gray-600"
          >
            &larr; Back to User Info
          </button>
        </div>
      </form>
    </Form>
  );
}
