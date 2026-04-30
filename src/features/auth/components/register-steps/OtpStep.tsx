"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { confirmEmailVerificationBodySchema } from "@/features/auth/schemas/auth.schema";
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

type OtpStepValues = z.infer<typeof confirmEmailVerificationBodySchema>;

interface Props {
  email: string;
  onNext: (values: OtpStepValues) => void | Promise<void>;
  onPrev: () => void;
}

export function OtpStep({ email, onNext, onPrev }: Props) {
  const form = useForm<OtpStepValues>({
    resolver: zodResolver(confirmEmailVerificationBodySchema),
    defaultValues: { email, code: "" },
  });

  useEffect(() => {
    form.setValue("email", email);
  }, [email, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await onNext(values);
        })}
        className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500"
      >
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Verify OTP</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-gray-500">
            Please enter the 6-digit code sent to:
            <br />
            <span className="font-bold text-slate-800">{email}</span>
          </p>
        </div>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Verification code</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  className="h-[50px] rounded-none border-gray-200 text-center text-lg font-bold focus-visible:ring-blue-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-6 h-12 w-full cursor-pointer rounded-none bg-[#175FFF] font-semibold text-white hover:bg-blue-700">
          Verify Code
        </Button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onPrev}
            className="cursor-pointer text-xs font-bold text-gray-400 transition-colors hover:text-gray-600"
          >
            &larr; Back to Email
          </button>
        </div>
      </form>
    </Form>
  );
}
