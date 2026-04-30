import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepIndicator({ currentStep, totalSteps = 4 }: StepIndicatorProps) {
  return (
    <div className="flex items-center w-full max-w-[280px] mx-auto mb-10">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
            {/* الدائرة بتاعت الخطوة */}
            <div
              className={`flex items-center justify-center w-[10px] h-[10px] rounded-full shrink-0 border-[1.5px] transition-colors duration-300 ${
                isActive
                  ? "border-blue-600 bg-white ring-4 ring-blue-50"
                  : isCompleted
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-200 bg-white"
              }`}
            >
              {isCompleted && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
            </div>

            {/* الخط الواصل بين الخطوات */}
            {stepNumber < totalSteps && (
              <div
                className={`flex-1 h-[1.5px] mx-2 transition-colors duration-300 ${
                  isCompleted ? "bg-blue-600" : "bg-gray-200"
                }`}
                // عشان نعمل الخط منقط لو مش مكتمل (اختياري، ممكن تشيل الـ style ده لو عايزه خط متصل)
                style={!isCompleted ? { backgroundImage: 'linear-gradient(to right, #E5E7EB 50%, transparent 50%)', backgroundSize: '6px 1px', backgroundRepeat: 'repeat-x', backgroundColor: 'transparent' } : {}}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
