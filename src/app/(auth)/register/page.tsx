"use client";

import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col py-4">
      <div className="mb-8">
        <h2 className="text-[32px] font-bold tracking-tight text-slate-900">Create Account</h2>
        <p className="mt-2 text-sm text-slate-500">
          Verify your email with the code we send, then complete your profile and password.
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
