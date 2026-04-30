import { BookOpen, Braces, FileText, FolderCode } from "lucide-react";

export function AuthBanner() {
  return (
    <div className="flex h-full flex-col justify-center bg-gradient-to-b from-[#ebf2ff] to-[#dae8ff] relative">
      
      {/* mx-auto هى السر هنا عشان توصل المحتوى بالكامل في النص */}
      <div className="w-full max-w-[420px] mx-auto px-6">
        
        {/* نقلنا اللوجو هنا عشان يبقى محاذي للنصوص بالظبط */}
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg mb-16">
          <FolderCode className="w-6 h-6" />
          <span>Exam App</span>
        </div>

        <h1 className="mb-12 text-[34px] font-bold leading-[1.15] text-slate-900 tracking-tight">
          Empower your learning journey with our smart exam platform.
        </h1>
        
        <div className="space-y-10">
          {/* Feature 1 */}
          <div className="flex items-start gap-5">
            <div className="mt-0.5 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-none border-[1.5px] border-blue-400 text-blue-500 bg-transparent">
              <Braces className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-blue-500 text-[17px] mb-2 tracking-wide">Tailored Diplomas</h3>
              <p className="text-[13px] text-slate-600 font-medium leading-relaxed max-w-[280px]">
                Choose from specialized tracks like Frontend, Backend, and Mobile Development.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-5">
            <div className="mt-0.5 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-none border-[1.5px] border-blue-400 text-blue-500 bg-transparent">
              <BookOpen className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-blue-500 text-[17px] mb-2 tracking-wide">Focused Exams</h3>
              <p className="text-[13px] text-slate-600 font-medium leading-relaxed max-w-[280px]">
                Access topic-specific tests including HTML, CSS, JavaScript, and more.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-5">
            <div className="mt-0.5 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-none border-[1.5px] border-blue-400 text-blue-500 bg-transparent">
              <FileText className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-bold text-blue-500 text-[17px] mb-2 tracking-wide">Smart Multi-Step Forms</h3>
              <p className="text-[13px] text-slate-600 font-medium leading-relaxed max-w-[280px]">
                Choose from specialized tracks like Frontend, Backend, and Mobile Development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
