"use client";

import { useEffect, useState } from "react";
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type OtpStepValues = z.infer<typeof confirmEmailVerificationBodySchema>;

interface Props {
  email: string;
  onNext: (values: OtpStepValues) => void | Promise<void>;
  onPrev: () => void;
  onResend: () => void | Promise<void>;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function OtpStep({ email, onNext, onPrev, onResend }: Props) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<OtpStepValues>({
    resolver: zodResolver(confirmEmailVerificationBodySchema),
    defaultValues: { email, code: "" },
  });

  useEffect(() => {
    form.setValue("email", email);
  }, [email, form]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success("Verification code resent.");
    } catch {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

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

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="mt-6 h-12 w-full cursor-pointer rounded-none bg-[#175FFF] font-semibold text-white hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={cooldown > 0 || isResending}
            className="cursor-pointer text-xs font-bold text-[#175FFF] transition-colors hover:underline disabled:cursor-not-allowed disabled:text-gray-400"
          >
            {cooldown > 0
              ? `Resend code in ${cooldown}s`
              : isResending
                ? "Sending..."
                : "Resend code"}
          </button>
        </div>

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
