"use client";

import { Suspense } from "react";
import ForgotPasswordContent from "./ForgotPasswordContent";

export default function ForgotPasswordRoute() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-slate-500">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
