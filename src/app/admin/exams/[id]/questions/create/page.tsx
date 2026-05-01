"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { X, Save, Plus, Trash2, CheckCheck, FileText, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import type { Exam } from "@/types/models";
import type { AppSession } from "@/types/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuestionItem = {
  id: string;
  headline: string;
  answers: Answer[];
};

export default function CreateQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const typedSession = session as AppSession | null;
  const token = typedSession?.accessToken;
  const examId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState(examId);
  
  const [isBulkMode, setIsBulkMode] = useState(true); 
  const [questions, setQuestions] = useState<QuestionItem[]>([
    { id: '1', headline: "", answers: [] }
  ]);
  const [activeQId, setActiveQId] = useState('1');
  const [newAnswerText, setNewAnswerText] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    async function fetchExams() {
      try {
        const res = await fetch(`${BASE_URL}/api/exams`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) {
          const responsePayload = data.payload?.exams || data.payload?.data || data.payload || [];
          const actualExams: Exam[] = Array.isArray(responsePayload) ? responsePayload : [];
          setExams(actualExams);
        }
      } catch {
        toast.error("Failed to load exams.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchExams();
  }, [token]);

  const activeQuestionIndex = questions.findIndex(q => q.id === activeQId);
  const activeQuestion = questions[activeQuestionIndex];

  const updateActiveHeadline = (val: string) => {
    setQuestions(prev => prev.map(q => q.id === activeQId ? { ...q, headline: val } : q));
  };

  const handleAddAnswer = () => {
    if (!newAnswerText.trim()) return;
    const newAns: Answer = {
      id: Date.now().toString(),
      text: newAnswerText.trim(),
      isCorrect: activeQuestion.answers.length === 0,
    };
    
    setQuestions(prev => prev.map(q => 
      q.id === activeQId ? { ...q, answers: [...q.answers, newAns] } : q
    ));
    setNewAnswerText("");
    inputRef.current?.focus();
  };

  const handleDeleteAnswer = (ansId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === activeQId) {
        const updatedAnswers = q.answers.filter(a => a.id !== ansId);
        if (q.answers.find(a => a.id === ansId)?.isCorrect && updatedAnswers.length > 0) {
          updatedAnswers[0].isCorrect = true;
        }
        return { ...q, answers: updatedAnswers };
      }
      return q;
    }));
  };

  const handleMarkCorrect = (ansId: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === activeQId) {
        return { ...q, answers: q.answers.map(a => ({ ...a, isCorrect: a.id === ansId })) };
      }
      return q;
    }));
  };

  const addNewTab = () => {
    const newId = Date.now().toString();
    setQuestions([...questions, { id: newId, headline: "", answers: [] }]);
    setActiveQId(newId);
  };

  const deleteTab = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (questions.length === 1) {
      toast.error("You must have at least one question.");
      return;
    }
    const filtered = questions.filter(q => q.id !== idToDelete);
    setQuestions(filtered);
    if (activeQId === idToDelete) {
      setActiveQId(filtered[filtered.length - 1].id);
    }
  };

  const handleSave = async () => {
    const invalidQIndex = questions.findIndex(
      (q) =>
        !q.headline.trim() ||
        q.answers.length < 2 ||
        !q.answers.some((a) => a.isCorrect)
    );

    if (invalidQIndex !== -1) {
      toast.error(`Please complete Q${invalidQIndex + 1}: headline + 2 answers minimum and one correct.`);
      setActiveQId(questions[invalidQIndex].id);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        questions: questions.map((q) => ({
          text: q.headline,
          answers: q.answers.map((a) => ({
            text: a.text,
            isCorrect: a.isCorrect,
          })),
        })),
      };

      const ENDPOINT = `${BASE_URL}/api/questions/exam/${selectedExamId}/bulk`;

      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success(`Successfully added ${questions.length} question(s)!`);
        router.push(`/admin/exams/${selectedExamId}`);
        router.refresh();
      } else {
        toast.error((data as { message?: string }).message || "Failed to save questions.");
      }
    } catch {
      toast.error("A network error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-[100vh]"><Loader2 className="animate-spin text-[#175FFF] w-8 h-8" /></div>;
  }

  return (
    <div className="w-full animate-in fade-in duration-300 pb-20 bg-slate-50 min-h-screen font-mono">
      
      {/* ─── Header ─── */}
      <div className="bg-white w-full border-b border-gray-200 px-4 md:px-8 py-5 sticky top-0 z-20 shadow-sm">
        <div className="text-[11px] md:text-[12px] font-bold tracking-wide mb-4 text-slate-400 uppercase flex flex-wrap items-center gap-1">
          <Link href="/admin/exams" className="hover:text-slate-600 transition-colors cursor-pointer">Exams</Link>
          <span className="text-slate-300">/</span>
          <Link href={`/admin/exams/${examId}`} className="hover:text-slate-600 transition-colors cursor-pointer truncate max-w-[120px] sm:max-w-none">Exam Details</Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#175FFF] font-black">Add Questions</span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
          <button 
            onClick={() => setIsBulkMode(!isBulkMode)}
            className={`flex items-center justify-center text-[13px] font-bold h-[38px] px-5 rounded-[4px] transition-colors border cursor-pointer w-full sm:w-auto ${
              isBulkMode ? "bg-[#175FFF] text-white border-[#175FFF] shadow-sm" : "bg-[#F8FAFC] text-slate-600 border-gray-200 hover:bg-[#F1F5F9]"
            }`}
          >
            <FileText size={16} className="mr-2.5" /> Bulk Add Mode
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button 
              onClick={() => router.back()} 
              className="flex-1 sm:flex-none flex items-center justify-center bg-[#F8FAFC] border border-gray-200 text-slate-600 hover:bg-[#F1F5F9] hover:text-slate-800 text-[13px] font-bold h-[38px] px-6 rounded-[4px] transition-colors cursor-pointer"
            >
              <X size={16} className="mr-2 sm:mr-2.5" strokeWidth={2.5} /> Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isSaving} 
              className="flex-1 sm:flex-none flex items-center justify-center bg-[#00C853] hover:bg-[#00B549] text-white text-[13px] font-bold h-[38px] px-6 rounded-[4px] shadow-sm transition-colors cursor-pointer disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={16} className="mr-2 sm:mr-2.5 animate-spin" /> : <Save size={16} className="mr-2 sm:mr-2.5" strokeWidth={2.5} />} 
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6 max-w-[1400px] mx-auto">
        
        {/* ─── Exam Info Section ─── */}
        <div className="bg-white border border-gray-200 shadow-sm w-full rounded-[4px] overflow-hidden">
          <div className="bg-[#175FFF] px-4 md:px-6 py-3">
            <h2 className="text-white text-[13px] md:text-[14px] font-bold tracking-wide uppercase">Exam Info</h2>
          </div>
          <div className="p-4 md:p-6">
            <label className="block text-[11px] md:text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Select Exam</label>
            <div className="relative">
              <select 
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="h-11 w-full border border-gray-200 bg-[#F8FAFC] hover:bg-white px-4 text-[13px] text-slate-700 focus:outline-none focus:border-[#175FFF] focus:ring-1 focus:ring-[#175FFF] rounded-[4px] appearance-none cursor-pointer transition-all"
              >
                <option value="" disabled>Select exam</option>
                {exams.map((ex: Exam) => <option key={ex._id || ex.id} value={ex._id || ex.id}>{ex.title || ex.name}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Questions Section ─── */}
        <div className="bg-white border border-gray-200 shadow-sm w-full rounded-[4px] overflow-hidden">
          <div className="bg-[#175FFF] px-4 md:px-6 py-3">
            <h2 className="text-white text-[13px] md:text-[14px] font-bold tracking-wide uppercase">Questions Builder</h2>
          </div>

          {/* Tabs (Responsive & Scrollable) */}
          {isBulkMode && (
            <div className="flex border-b border-gray-200 bg-[#F8FAFC] overflow-x-auto scrollbar-hide">
              {questions.map((q, idx) => {
                const isActive = activeQId === q.id;
                return (
                  <div 
                    key={q.id}
                    onClick={() => setActiveQId(q.id)}
                    className={`relative flex items-center justify-center h-[48px] cursor-pointer text-[13px] font-bold transition-all border-r border-gray-200 group px-8 md:px-12 shrink-0 ${
                      isActive 
                        ? "text-[#175FFF] bg-white border-b-2 border-b-white z-10 -mb-[1px]" 
                        : "text-slate-500 hover:bg-[#F1F5F9] hover:text-slate-700"
                    }`}
                  >
                    Q{idx + 1}
                    {questions.length > 1 && isActive && (
                      <span 
                        onClick={(e) => deleteTab(q.id, e)}
                        className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer"
                      >
                        <X size={14} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                );
              })}
              <div 
                onClick={addNewTab} 
                className="flex items-center justify-center w-[56px] h-[48px] cursor-pointer text-slate-400 hover:text-slate-600 bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors border-r border-gray-200 shrink-0"
              >
                <Plus size={20} strokeWidth={2.5} />
              </div>
            </div>
          )}

          <div className="p-4 md:p-6">
            <label className="block text-[11px] md:text-[12px] font-bold text-slate-400 mb-2 uppercase tracking-wider">Question Headline</label>
            <input 
              type="text"
              value={activeQuestion?.headline || ""}
              onChange={(e) => updateActiveHeadline(e.target.value)}
              className="w-full h-11 px-4 mb-8 md:mb-12 text-[13px] text-slate-800 border border-gray-200 bg-[#F8FAFC] focus:bg-white rounded-[4px] outline-none focus:border-[#175FFF] focus:ring-1 focus:ring-[#175FFF] transition-all"
              placeholder="Type your question here..."
            />

            {/* Answers Box */}
            <div className="border border-blue-100 rounded-[4px] overflow-hidden shadow-sm">
              <div className="bg-[#F8FAFC] border-b border-blue-100 flex justify-between items-center h-[54px] pr-0">
                <span className="text-[11px] md:text-[12px] text-slate-500 font-bold tracking-widest uppercase pl-4 md:pl-[76px]">
                  Answers
                </span>
                <button 
                  onClick={() => inputRef.current?.focus()} 
                  className="bg-[#175FFF] hover:bg-blue-700 text-white text-[12px] md:text-[13px] font-bold h-full px-4 md:px-6 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Add Answer</span>
                </button>
              </div>
              
              <div className="divide-y divide-gray-100 bg-white">
                {activeQuestion?.answers.map((answer) => (
                  <div key={answer.id} className="flex flex-col sm:flex-row sm:items-stretch min-h-[58px] hover:bg-slate-50 transition-colors group">
                    
                    <div className="flex-1 flex items-center pl-4 pr-4 py-3 sm:py-0 text-[13px] text-slate-700 font-medium order-2 sm:order-1 border-t border-gray-100 sm:border-none">
                      {answer.text}
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end shrink-0 px-4 py-3 sm:py-0 bg-slate-50 sm:bg-transparent order-1 sm:order-2">
                       <button 
                        onClick={() => handleDeleteAnswer(answer.id)} 
                        className="w-[36px] h-[36px] sm:w-[60px] sm:h-auto flex items-center justify-center bg-white sm:bg-transparent border border-gray-200 sm:border-none rounded-md sm:rounded-none sm:border-l sm:border-gray-100 text-slate-400 hover:text-red-600 sm:hover:bg-red-50 transition-colors cursor-pointer order-2 sm:order-1"
                        title="Delete answer"
                      >
                        <Trash2 size={16} strokeWidth={2} />
                      </button>

                      <div className="sm:pl-4 sm:pr-2 order-1 sm:order-2">
                        {answer.isCorrect ? (
                          <div className="flex items-center gap-2 text-[#00C853] text-[12px] md:text-[13px] font-bold bg-[#E8F8F0] px-3 py-1.5 rounded-md">
                            <CheckCheck size={16} strokeWidth={3} className="text-[#00C853]" />
                            Correct
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleMarkCorrect(answer.id)} 
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-[12px] md:text-[13px] font-bold px-3 py-1.5 bg-white border border-gray-200 sm:bg-[#F8FAFC] sm:border-none sm:hover:bg-[#E2E8F0] rounded-[4px] transition-colors cursor-pointer shadow-sm sm:shadow-none"
                          >
                            <Check size={14} strokeWidth={3} className="text-slate-400" /> Mark
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* ── ADD ANSWER ROW ── */}
                <div className="flex flex-col sm:flex-row items-center min-h-[80px] bg-[#F4FBF7] p-4 sm:pr-6 sm:pl-0 border-t border-gray-100 gap-3 sm:gap-0">
                  
                  <div className="hidden sm:flex w-[60px] items-center justify-center shrink-0">
                    <button 
                      onClick={() => setNewAnswerText("")}
                      className="w-[28px] h-[28px] flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors cursor-pointer shadow-sm"
                      title="Clear text"
                    >
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>

                  <div className="flex-1 flex w-full h-11 sm:ml-4 rounded-[4px] overflow-hidden bg-white" style={{ boxShadow: "0 0 0 1.5px #00C853" }}>
                    <input 
                      ref={inputRef}
                      type="text"
                      value={newAnswerText}
                      onChange={(e) => setNewAnswerText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddAnswer()}
                      placeholder="Type a new answer..."
                      className="flex-1 h-full px-4 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 bg-transparent"
                    />
                    <button 
                      onClick={handleAddAnswer} 
                      className="bg-[#00C853] hover:bg-[#00B549] text-white text-[13px] font-bold h-full px-6 sm:px-8 flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
                    >
                      <Plus size={16} strokeWidth={3} />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}