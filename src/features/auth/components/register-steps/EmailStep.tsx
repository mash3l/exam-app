"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendEmailVerificationBodySchema } from "@/features/auth/schemas/auth.schema";
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

type EmailStepValues = z.infer<typeof sendEmailVerificationBodySchema>;

interface Props {
  onNext: (email: string) => void | Promise<void>;
}

export function EmailStep({ onNext }: Props) {
  const form = useForm<EmailStepValues>({
    resolver: zodResolver(sendEmailVerificationBodySchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: EmailStepValues) {
    await onNext(values.email);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
        <div className="space-y-2">
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
        </div>

        <Button type="submit" className="mt-4 h-12 w-full cursor-pointer rounded-none bg-[#175FFF] font-semibold text-white hover:bg-blue-700">
          Next
        </Button>

        <div className="mt-8 text-center text-xs font-medium text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="cursor-pointer font-bold text-blue-600 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
