"use client";

import { useState } from "react";
// استيراد المكونات اللي لسه عاملينها
import { EmailStep } from "@/features/auth/components/forgot-password-steps/EmailStep";
import { SuccessStep } from "@/features/auth/components/forgot-password-steps/SuccessStep";
import { NewPasswordStep } from "@/features/auth/components/forgot-password-steps/NewPasswordStep";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);

  // دوال التنقل
  const nextStep = () => setStep((prev) => (prev < 3 ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="w-full max-w-[380px] flex flex-col mx-auto py-4">
      {step === 1 && <EmailStep nextStep={nextStep} />}
      {step === 2 && <SuccessStep prevStep={prevStep} nextStep={nextStep} />}
      {step === 3 && <NewPasswordStep />}
    </div>
  );
}