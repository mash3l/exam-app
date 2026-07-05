"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { EmailStep } from "@/features/auth/components/register-steps/EmailStep";
import { OtpStep } from "@/features/auth/components/register-steps/OtpStep";
import { UserInfoStep, type UserInfoValues } from "@/features/auth/components/register-steps/UserInfoStep";
import { PasswordStep } from "@/features/auth/components/register-steps/PasswordStep";
import { StepIndicator } from "@/features/auth/components/StepIndicator";
import {
  confirmEmailVerification,
  registerAccount,
  sendEmailVerification,
} from "@/features/auth/api/auth-register-api";

type Step = "email" | "otp" | "user" | "password";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function stepToNumber(step: Step): number {
  switch (step) {
    case "email":
      return 1;
    case "otp":
      return 2;
    case "user":
      return 3;
    case "password":
      return 4;
    default:
      return 1;
  }
}

export function RegisterForm() {
  const router = useRouter();
  const registerRoot = useForm<{ _noop?: string }>({ defaultValues: {} });
  const { errors: registerErrors } = registerRoot.formState;

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfoValues | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="relative">
      <StepIndicator currentStep={stepToNumber(step)} totalSteps={4} />

      {busy ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/70">
          <Loader2 className="h-8 w-8 animate-spin text-[#175FFF]" aria-hidden />
        </div>
      ) : null}

      {registerErrors.root ? (
        <p
          className="mb-4 text-sm font-medium text-destructive"
          role="alert"
          id="register-api-root-error"
        >
          {String(registerErrors.root.message)}
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {step === "email" ? (
        <EmailStep
          onNext={async (nextEmail) => {
            setError("");
            registerRoot.clearErrors("root");
            setBusy(true);
            try {
              const normalized = normalizeEmail(nextEmail);
              const res = await sendEmailVerification(normalized);
              if (!res.ok) {
                setError(res.message);
                return;
              }
              setEmail(normalized);
              setEmailVerified(false);
              setStep("otp");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {step === "otp" ? (
        <OtpStep
          email={email}
          onPrev={() => {
            setError("");
            registerRoot.clearErrors("root");
            setEmailVerified(false);
            setStep("email");
          }}
          onResend={async () => {
            const res = await sendEmailVerification(normalizeEmail(email));
            if (!res.ok) {
              throw new Error(res.message);
            }
          }}
          onNext={async (values) => {
            setError("");
            registerRoot.clearErrors("root");
            setBusy(true);
            try {
              const code = values.code.replace(/\s/g, "").replace(/\D/g, "").slice(0, 6);
              const res = await confirmEmailVerification({
                email: normalizeEmail(email),
                code,
              });
              if (!res.ok) {
                setError(res.message);
                return;
              }
              setEmailVerified(true);
              setStep("user");
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}

      {step === "user" ? (
        <UserInfoStep
          onNext={(values) => {
            setError("");
            registerRoot.clearErrors("root");
            setUserInfo(values);
            setStep("password");
          }}
        />
      ) : null}

      {step === "password" && userInfo ? (
        <PasswordStep
          onPrev={() => {
            setError("");
            registerRoot.clearErrors("root");
            setStep("user");
          }}
          onSubmit={async (pw) => {
            setError("");
            registerRoot.clearErrors("root");
            if (!emailVerified) {
              registerRoot.setError("root", {
                message:
                  "Your email is not verified yet. Go back and complete the code step, then try again.",
              });
              return;
            }
            setBusy(true);
            try {
              const res = await registerAccount({
                username: userInfo.username,
                email: normalizeEmail(email),
                password: pw.password,
                confirmPassword: pw.confirmPassword,
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                phone: (userInfo.phone ?? "").trim(),
              });

              if (!res.ok) {
                if (Object.keys(res.fieldFailures).length > 0) {
                  registerRoot.setError("root", {
                    message: `${res.message} (${Object.keys(res.fieldFailures).join(", ")})`,
                  });
                } else {
                  registerRoot.setError("root", { message: res.message });
                }
                return;
              }

              router.push("/login");
            } catch (err) {
              const fallback =
                err instanceof Error ? err.message : "Something went wrong. Please try again.";
              registerRoot.setError("root", { message: fallback });
            } finally {
              setBusy(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
