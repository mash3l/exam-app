import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface SuccessStepProps {
  prevStep: () => void;
  nextStep: () => void; // دي عشان زرار الديفيلوبر
}

export function SuccessStep({ prevStep, nextStep }: SuccessStepProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative mt-4">
      {/* زرار الرجوع */}
      <button 
        onClick={prevStep} 
        className="absolute -top-14 left-0 text-gray-400 hover:text-gray-700 transition-colors border border-gray-200 p-1 cursor-pointer"
      >
        <ArrowLeft size={20} strokeWidth={1.5} />
      </button>

      <div className="mb-8">
        <h2 className="text-[32px] font-bold text-slate-900 tracking-tight mb-6">Password Reset Sent</h2>
        
        <div className="space-y-5 text-[13px] font-medium text-gray-500 leading-relaxed max-w-[340px]">
          <p>
            We have sent a password reset link to:<br/>
            <span className="font-bold text-blue-600">user@example.com</span>.
          </p>
          <p>
            Please check your inbox and follow the instructions to reset your password.
          </p>
          <p>
            If you don&apos;t see the email within a few minutes, check your spam or junk folder.
          </p>
        </div>
      </div>

      <div className="mt-12 text-xs font-medium text-gray-400">
        Don&apos;t have an account?{" "} 
        <Link href="/register" className="text-blue-600 font-bold hover:underline cursor-pointer">
          Create yours
        </Link>
      </div>

      {/* زرار للمطورين فقط */}
      <div className="pt-10 text-center">
         <button onClick={nextStep} className="text-[10px] text-gray-300 hover:text-blue-500 underline cursor-pointer">
           (Dev Only: Go to Create Password Step)
         </button>
      </div>
    </div>
  );
}
