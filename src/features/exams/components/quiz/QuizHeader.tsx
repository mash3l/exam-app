import Link from "next/link";
import { ChevronLeft, HelpCircle } from "lucide-react";

export type QuizHeaderProps = {
  diplomaName: string;
  examName: string;
  diplomaId: string;
  currentIndex: number;
  totalQuestions: number;
  showResults: boolean;
  examTitleFromApi?: string;
  timeLeft: number;
  totalTime?: number;
};

export function QuizHeader({
  diplomaName,
  examName,
  diplomaId,
  currentIndex,
  totalQuestions,
  showResults,
  examTitleFromApi,
  timeLeft,
  totalTime = 1200,
}: QuizHeaderProps) {
  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const timePercentage = Math.max(0, Math.min(100, ((timeLeft || 0) / totalTime) * 100));

  const safeExamName = examTitleFromApi || (examName && examName.length > 20 ? "Exam" : examName);
  const safeDiplomaName = diplomaName && diplomaName.length > 20 ? "Diploma" : diplomaName;

  return (
    <>
      <nav className="mb-6 flex gap-2 px-4 font-mono text-[11px] text-gray-400">
        <Link href="/diplomas" className="hover:text-blue-600">
          Diplomas
        </Link>{" "}
        /
        <Link href={`/exams/${diplomaId}`} className="capitalize hover:text-blue-600">
          {safeDiplomaName}
        </Link>{" "}
        /<span className="font-bold capitalize text-blue-600">{safeExamName}</span>
      </nav>

      <div className="mb-8 flex gap-4 px-4">
        <Link
          href={`/exams/${diplomaId}`}
          className="flex w-14 items-center justify-center rounded-none border border-gray-200 bg-white text-[#175FFF] shadow-sm transition-all hover:bg-gray-50"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </Link>

        <div className="flex flex-1 items-center gap-4 bg-[#175FFF] p-4 text-white shadow-sm">
          <HelpCircle size={28} strokeWidth={2} />
          <h1 className="font-mono text-xl font-bold capitalize leading-tight tracking-tight">{safeExamName} Questions</h1>
        </div>
      </div>

      <div className="mb-8 flex items-end justify-between gap-8 px-10">
        <div className="flex-1 space-y-4">
          <div className="flex items-end justify-between font-mono text-[12px] font-bold text-slate-700">
            <span className="capitalize">{safeDiplomaName} Quiz</span>
            <span>
              Question{" "}
              <span className="text-[#175FFF]">{showResults ? totalQuestions : currentIndex + 1}</span> of{" "}
              {totalQuestions}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-none bg-gray-100">
            <div
              className="h-full bg-[#175FFF] transition-all duration-500"
              style={{ width: `${((currentIndex + (showResults ? 1 : 0)) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {!showResults && (
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 shadow-sm">
            <div
              className="absolute inset-0 rounded-full transition-all duration-1000"
              style={{ background: `conic-gradient(#175FFF ${timePercentage}%, transparent 0)` }}
            />
            <div className="absolute inset-[5px] flex items-center justify-center rounded-full bg-white">
              <span
                className={`font-mono text-[11px] font-bold ${timeLeft <= 60 ? "animate-pulse text-red-500" : "text-slate-800"}`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
