"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { EmailStep } from "@/features/auth/components/forgot-password-steps/EmailStep";
import { SuccessStep } from "@/features/auth/components/forgot-password-steps/SuccessStep";
import { NewPasswordStep } from "@/features/auth/components/forgot-password-steps/NewPasswordStep";

export default function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  if (token) {
    return (
      <div className="w-full max-w-[380px] flex flex-col mx-auto py-4">
        <NewPasswordStep />
      </div>
    );
  }

  const nextStep = () => setStep((prev) => (prev < 2 ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="w-full max-w-[380px] flex flex-col mx-auto py-4">
      {step === 1 && <EmailStep nextStep={nextStep} setEmail={setEmail} />}
      {step === 2 && <SuccessStep prevStep={prevStep} email={email} />}
    </div>
  );
}
