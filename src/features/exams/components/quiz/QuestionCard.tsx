"use client";

import { useEffect } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import type { QuizSessionAnswersFormValues } from "@/features/exams/schemas/quiz-form.schema";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormControl, FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { cn } from "@/lib/utils/tailwind-cn";

export type QuestionOption = {
  id: string;
  label: string;
};

export type QuestionCardProps = {
  index: number;
  questionId: string;
  questionText: string;
  options: QuestionOption[];
  mode?: "single" | "multiple";
  namePrefix?: string;
};

export function QuestionCard({
  index,
  questionId,
  questionText,
  options,
  mode = "single",
  namePrefix = "answers",
}: QuestionCardProps) {
  const { control, setValue, getValues } = useFormContext();
  const base = `${namePrefix}.${index}`;

  useEffect(() => {
    const path = `${base}.questionId`;
    if (getValues(path) !== questionId) {
      setValue(path, questionId, { shouldValidate: false });
    }
  }, [base, getValues, questionId, setValue]);

  if (mode === "multiple") {
    return (
      <div className="flex-1 space-y-4 px-10">
        <h2 className="mb-4 text-[20px] font-bold font-mono leading-relaxed tracking-tight text-[#175FFF]">
          {questionText}
        </h2>
        <FormField
          control={control}
          name={`${base}.questionId` as FieldPath<QuizSessionAnswersFormValues>}
          render={({ field }) => <input type="hidden" {...field} value={questionId} readOnly />}
        />
        <FormField
          control={control}
          name={`${base}.answerIds` as FieldPath<QuizSessionAnswersFormValues>}
          render={({ field }) => (
            <FormItem>
              <div className="space-y-3">
                {options.map((opt) => {
                  const selected: string[] = Array.isArray(field.value) ? field.value : [];
                  const checked = selected.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-none border-2 p-4 transition-colors",
                        checked ? "border-blue-200 bg-blue-50/50" : "border-transparent bg-white/50 hover:bg-white"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          const next =
                            isChecked === true ? [...selected, opt.id] : selected.filter((id) => id !== opt.id);
                          field.onChange(next);
                        }}
                      />
                      <span className="font-mono text-[13px] font-medium text-slate-700">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 px-10">
      <h2 className="mb-4 text-[20px] font-bold font-mono leading-relaxed tracking-tight text-[#175FFF]">
        {questionText}
      </h2>
      <FormField
        control={control}
        name={`${base}.questionId` as FieldPath<QuizSessionAnswersFormValues>}
        render={({ field }) => <input type="hidden" {...field} value={questionId} readOnly />}
      />
      <FormField
        control={control}
        name={`${base}.answerId` as FieldPath<QuizSessionAnswersFormValues>}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RadioGroup onValueChange={field.onChange} value={field.value ?? ""} className="space-y-3">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-start gap-3 rounded-none border-2 border-transparent p-4 has-[[data-slot=radio-group-item][data-state=checked]]:border-blue-200 has-[[data-slot=radio-group-item][data-state=checked]]:bg-blue-50/50"
                  >
                    <RadioGroupItem value={opt.id} id={`${base}-${opt.id}`} className="mt-1" />
                    <label htmlFor={`${base}-${opt.id}`} className="cursor-pointer font-mono text-[13px] font-medium text-slate-700">
                      {opt.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
