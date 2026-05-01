"use client";

import { useState, Suspense, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";

import { useExamQuestions } from "@/features/exams/hooks/useExamQuestions";
import {
  quizSessionAnswersFormSchema,
  type QuizSessionAnswersFormValues,
} from "@/features/exams/schemas/quiz-form.schema";
import { QuizHeader } from "@/features/exams/components/quiz/QuizHeader";
import { QuestionCard } from "@/features/exams/components/quiz/QuestionCard";
import { QuizResults, type QuizResultsPayload } from "@/features/exams/components/quiz/QuizResults";
import { Form } from "@/shared/ui/form";

function buildOptionsFromQuestion(q: Record<string, unknown>) {
  const raw = (q.answers ?? q.options ?? q.choices ?? []) as unknown[];
  return raw.map((opt: unknown, index: number) => {
    if (typeof opt === "string") {
      return { id: String(index), label: opt };
    }
    const o = opt as Record<string, unknown>;
    const id = String(o.id ?? o._id ?? o.key ?? index);
    const label = String(
      o.answer ?? o.title ?? o.text ?? o.key ?? o.answerText ?? `Option ${index + 1}`
    );
    return { id, label };
  });
}

function stableQuestionId(q: Record<string, unknown>, index: number): string {
  const raw =
    q.id ??
    q._id ??
    q.questionId ??
    (q as { question_id?: unknown }).question_id;
  const s = raw !== undefined && raw !== null ? String(raw).trim() : "";
  if (s) return s;
  return `q-${index}`;
}

function mergeAnswersWithQuestions(
  questionsList: Record<string, unknown>[],
  partial: QuizSessionAnswersFormValues["answers"] | undefined
): QuizSessionAnswersFormValues["answers"] {
  return questionsList.map((q, i) => {
    const row = partial?.[i];
    return {
      questionId: stableQuestionId(q, i),
      answerId: String(row?.answerId ?? "").trim(),
    };
  });
}

function QuizContent() {
  const params = useParams();
  const examId = params?.examId as string;
  const diplomaId = params?.diplomaId as string;

  const diplomaName = diplomaId ? diplomaId.replace(/-/g, " ") : "Diploma";
  const examName = examId ? examId.replace(/-/g, " ") : "Quiz";

  const { data: apiQuestions, isLoading, isError } = useExamQuestions(examId);
  const questions = useMemo(() => (apiQuestions || []) as Record<string, unknown>[], [apiQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResults, setApiResults] = useState<QuizResultsPayload | null>(null);
  const [startedAt] = useState(() => new Date().toISOString());

  const durationInMinutes = (questions[0]?.exam as { duration?: number } | undefined)?.duration ?? 20;
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);

  const form = useForm<QuizSessionAnswersFormValues>({
    resolver: zodResolver(quizSessionAnswersFormSchema),
    defaultValues: {
      examId: examId ?? "",
      startedAt,
      answers: [],
    },
  });

  const { errors: formErrors } = form.formState;

  useEffect(() => {
    if (!questions.length || !examId) return;

    const currentAnswers = form.getValues("answers");
    if (currentAnswers && currentAnswers.length === questions.length) {
      return; 
    }

    form.reset({
      examId,
      startedAt,
      answers: questions.map((q, i) => ({
        questionId: stableQuestionId(q, i),
        answerId: "",
      })),
    });
  }, [questions, examId, startedAt, form]);

  const currentAnswerId = useWatch({
    control: form.control,
    name: `answers.${currentIndex}.answerId`,
  });

  const submitQuizValidated = async (opts?: { timeExpired?: boolean }) => {
    form.clearErrors("root");
    const raw = form.getValues();
    const values: QuizSessionAnswersFormValues = {
      examId: String(raw.examId ?? examId ?? "").trim(),
      startedAt: raw.startedAt ?? startedAt,
      answers: mergeAnswersWithQuestions(questions, raw.answers),
    };

    if (!opts?.timeExpired) {
      const parsed = quizSessionAnswersFormSchema.safeParse(values);
      if (!parsed.success) {
        form.setError("root", {
          message: parsed.error.issues[0]?.message ?? "Please answer all questions before submitting.",
        });
        return;
      }
    }

    setIsSubmitting(true);
    setShowResults(true);

    const formattedAnswers = values.answers
      .filter((a) => String(a.answerId ?? "").trim())
      .map((a) => ({
        questionId: a.questionId,
        answerId: a.answerId,
      }));

    // ==========================================
    //   التعديل هنا: توليد بيانات حقيقية (Mock) للنتيجة 
    // ==========================================
    const total = questions.length || 1;

    const mockAnalytics = questions.map((q, idx) => {
      const qId = stableQuestionId(q, idx);
      const userAnswer = formattedAnswers.find((a) => a.questionId === qId);
      const options = buildOptionsFromQuestion(q);
      
      // بنجيب نص الإجابة اللي اليوزر اختارها
      const selectedOptionText = options.find((o) => o.id === userAnswer?.answerId)?.label;
      
      // بنفترض إن الاختيار الأول دايماً هو الصح عشان نجرب بس
      const correctOptionText = options[0]?.label; 
      const isCorrect = userAnswer?.answerId === options[0]?.id;

      return {
        questionId: qId,
        questionText: String(q?.question ?? q?.title ?? q?.questionText ?? "Unknown Question"),
        isCorrect: isCorrect,
        selectedAnswer: selectedOptionText,
        correctAnswer: correctOptionText,
      };
    });

    const correctCount = mockAnalytics.filter((a) => a.isCorrect).length;
    const wrongCount = total - correctCount;

    const mockResults: QuizResultsPayload = {
      submission: {
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        totalQuestions: total,
      },
      analytics: mockAnalytics, // الداتا دي هي اللي هتملا القايمة اللي على اليمين
    };
    // ==========================================

    await new Promise((r) => setTimeout(r, 600));
    setApiResults(mockResults);
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (timeLeft <= 0 && !showResults && questions.length > 0) {
      void submitQuizValidated({ timeExpired: true });
      return;
    }
    if (!showResults && !isLoading && questions.length > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, showResults, isLoading, questions.length]);

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = async () => {
    // شيلنا الشرط اللي كان بيجبره يجاوب السؤال الحالي عشان يقلب
    if (isLastQuestion) {
      // لو ده آخر سؤال وداس Submit، هنتأكد إنه جاوب كله الأول
      const allOk = await form.trigger();
      if (!allOk) {
        const merged = mergeAnswersWithQuestions(questions, form.getValues("answers"));
        const idx = merged.findIndex(
          (a) => !String(a.questionId ?? "").trim() || !String(a.answerId ?? "").trim()
        );
        // لو ناسي سؤال، هنرجعهوله ونطلعله رسالة
        if (idx >= 0) {
          setCurrentIndex(idx);
          form.setError("root", { message: "You have unanswered questions. Please answer them before submitting." });
        }
        return;
      }
      await submitQuizValidated();
    } else {
      // لو مش آخر سؤال، يقلب عادي جداً سواء جاوب أو لأ
      form.clearErrors("root"); // بنشيل أي رسالة إيرور قديمة
      setCurrentIndex((prev) => prev + 1);
    }
  };
  const handleRestart = () => {
    setCurrentIndex(0);
    setShowResults(false);
    setTimeLeft(durationInMinutes * 60);
    setApiResults(null);
    if (questions.length && examId) {
      form.reset({
        examId,
        startedAt: new Date().toISOString(),
        answers: questions.map((q, i) => ({
          questionId: stableQuestionId(q, i),
          answerId: "",
        })),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#175FFF]" />
        <p className="font-mono text-sm text-slate-500">Preparing questions...</p>
      </div>
    );
  }

  if (isError || questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">No Questions Found</h2>
        <p className="max-w-xs text-center text-slate-500">
          This exam seems to be empty. Please try another exam or contact support.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="mx-auto flex min-h-[85vh] max-w-[1000px] flex-col border border-slate-100 bg-white py-2 shadow-sm animate-in fade-in duration-500">
        <QuizHeader
          diplomaName={diplomaName}
          examName={examName}
          diplomaId={diplomaId}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          showResults={showResults}
          timeLeft={timeLeft}
          totalTime={durationInMinutes * 60}
          examTitleFromApi={(questions[0]?.exam as { title?: string } | undefined)?.title}
        />

        {!showResults ? (
          <>
            {formErrors.root ? (
              <p
                className="mx-10 mt-2 text-center text-sm font-medium text-red-600 bg-red-50 py-2 border border-red-200"
                role="alert"
              >
                {String(formErrors.root.message)}
              </p>
            ) : null}

            {questions.map((q, idx) => {
              const qText =
                String(
                  q?.question ??
                    q?.questionText ??
                    q?.title ??
                    q?.text ??
                    q?.body ??
                    "Untitled Question"
                ) || "Untitled Question";
              const qId = stableQuestionId(q, idx);
              const options = buildOptionsFromQuestion(q);

              return (
                <div 
                  key={qId} 
                  className={idx === currentIndex ? "block animate-in fade-in" : "hidden"}
                >
                  <QuestionCard
                    index={idx}
                    questionId={qId}
                    questionText={qText}
                    options={options}
                    mode="single"
                  />
                </div>
              );
            })}

            <div className="mt-auto flex gap-4 px-10 py-8">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                disabled={isFirstQuestion || isSubmitting}
                className={`flex flex-1 items-center justify-center gap-2 rounded-none py-3.5 font-mono font-bold uppercase transition-all ${
                  isFirstQuestion
                    ? "cursor-not-allowed bg-gray-100 text-gray-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <button
                type="button"
                onClick={() => void handleNext()}
                disabled={isSubmitting} // خلينا القفل وقت التحميل بس
                className="flex flex-1 items-center justify-center gap-2 rounded-none py-3.5 font-mono font-bold uppercase transition-all bg-[#175FFF] text-white hover:bg-blue-700 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : isLastQuestion ? (
                  "Finish & Submit"
                ) : (
                  "Next"
                )}
                {!isSubmitting && <ChevronRight size={16} />}
              </button>
            </div>
          </>
        ) : (
          <QuizResults 
            apiResults={apiResults} 
            isLoading={isSubmitting} 
            handleRestart={handleRestart} 
          />
        )}
      </div>
    </Form>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#175FFF]" />
          <p className="font-mono text-sm text-slate-500">Loading quiz environment...</p>
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}