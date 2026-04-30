import Link from "next/link";
import { RotateCcw, Compass, Loader2 } from "lucide-react";

type AnswerLike = string | { title?: string; answer?: string; text?: string; key?: string } | null | undefined;

export type QuizSubmissionSummary = {
  correctAnswers?: number;
  wrongAnswers?: number;
  totalQuestions?: number;
};

export type QuizAnalyticsItem = {
  questionId?: string;
  questionText?: string;
  isCorrect?: boolean;
  selectedAnswer?: AnswerLike;
  correctAnswer?: AnswerLike;
};

export type QuizResultsPayload = {
  submission?: QuizSubmissionSummary;
  analytics?: QuizAnalyticsItem[];
};

export type QuizResultsProps = {
  apiResults: QuizResultsPayload | null;
  isLoading: boolean;
  handleRestart: () => void;
};

function getAnswerText(ansObj: AnswerLike): string {
  if (!ansObj) return "No Answer Selected";
  if (typeof ansObj === "string") return ansObj;
  return ansObj.title || ansObj.answer || ansObj.text || ansObj.key || "Unknown";
}

export function QuizResults({ apiResults, isLoading, handleRestart }: QuizResultsProps) {
  if (isLoading || !apiResults) {
    return (
      <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#175FFF]" />
        <p className="animate-pulse font-mono text-[15px] text-slate-500">Grading your exam & generating analytics...</p>
      </div>
    );
  }

  const { submission, analytics } = apiResults;
  const correctCount = submission?.correctAnswers ?? 0;
  const incorrectCount = submission?.wrongAnswers ?? 0;
  const total = submission?.totalQuestions ?? 1;
  const percentage = Math.round((correctCount / total) * 100);

  return (
    <div className="flex flex-1 flex-col px-10">
      <h2 className="mb-6 font-mono text-2xl font-bold tracking-tight text-[#175FFF]">Your Score:</h2>

      <div className="flex min-h-[400px] flex-1 flex-col gap-6 md:flex-row">
        <div className="flex w-full flex-col items-center justify-center border border-gray-100 bg-[#F4F8FF] p-8 md:w-[35%]">
          <div
            className="relative mb-10 h-48 w-48 rounded-full shadow-inner"
            style={{
              background: `conic-gradient(#10B981 0% ${percentage}%, #EF4444 ${percentage}% 100%)`,
            }}
          >
            <div className="absolute inset-[25px] flex flex-col items-center justify-center rounded-full bg-[#F4F8FF] shadow-sm">
              <span className="text-3xl font-black text-slate-800">{percentage}%</span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-400">Success Rate</span>
            </div>
          </div>
          <div className="w-full space-y-3 font-mono text-[13px] font-bold text-slate-800">
            <div className="flex items-center justify-between border-l-4 border-[#10B981] bg-white p-3 shadow-sm">
              <span>Correct</span>
              <span className="text-lg text-[#10B981]">{correctCount}</span>
            </div>
            <div className="flex items-center justify-between border-l-4 border-[#EF4444] bg-white p-3 shadow-sm">
              <span>Incorrect</span>
              <span className="text-lg text-[#EF4444]">{incorrectCount}</span>
            </div>
          </div>
        </div>

        <div className="custom-scrollbar max-h-[450px] flex-1 space-y-8 overflow-y-auto border border-dashed border-blue-200 p-6">
          {(analytics ?? []).map((item, index) => (
            <div key={item.questionId ?? index} className="space-y-3 border-b border-slate-50 pb-6">
              <h3 className="font-mono text-[14px] font-bold text-slate-800">
                {index + 1}. {item.questionText ?? "Question text unavailable"}
              </h3>

              {!item.isCorrect && (
                <div className="flex items-center gap-4 border border-red-100 bg-red-50 p-3">
                  <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <span className="font-mono text-[11px] text-red-600 line-through">{getAnswerText(item.selectedAnswer)}</span>
                </div>
              )}

              <div className="flex items-center gap-4 border border-green-100 bg-green-50 p-3">
                <div className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                <span className="font-mono text-[11px] font-bold text-green-700">{getAnswerText(item.correctAnswer)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex gap-4 py-8">
        <button
          type="button"
          onClick={handleRestart}
          className="flex flex-1 items-center justify-center gap-2 bg-slate-100 py-3.5 font-mono font-bold uppercase text-slate-600 shadow-sm transition-all hover:bg-slate-200"
        >
          <RotateCcw size={16} /> Restart
        </button>
        <Link
          href="/diplomas"
          className="flex flex-1 items-center justify-center gap-2 bg-[#175FFF] py-3.5 text-center font-mono font-bold uppercase text-white shadow-sm transition-all hover:bg-blue-700"
        >
          <Compass size={16} /> Explore More
        </Link>
      </div>
    </div>
  );
}
