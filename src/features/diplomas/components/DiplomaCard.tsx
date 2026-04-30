"use client";

import Link from "next/link";
import Image from "next/image";
// 🔥 1. ضفنا useRouter عشان نقدر نعمل Prefetch
import { useRouter } from "next/navigation"; 

interface DiplomaCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
}

export function DiplomaCard({ id, image, title, description }: DiplomaCardProps) {
  const router = useRouter(); // 🔥 2. تعريف الـ router

  // 🔥 الدالة السحرية اللي بتعالج كل مشاكل الباك إند
  const getValidImageUrl = (src: string) => {
    if (!src) return "https://images.unsplash.com/photo-1617042375876-a13e36732a04";
    
    let safeSrc = src;
    if (safeSrc.includes("www.elevate-bootcamp.cloud")) {
      safeSrc = safeSrc.replace("www.elevate-bootcamp.cloud", "exam-app.elevate-bootcamp.cloud");
    }

    if (safeSrc.startsWith("http")) return safeSrc;

    const cleanSrc = safeSrc.startsWith('/') ? safeSrc.slice(1) : safeSrc;
    return `https://exam-app.elevate-bootcamp.cloud/${cleanSrc}`;
  };

  const finalImage = getValidImageUrl(image);

  return (
    <Link 
      href={`/exams/${id}`} 
      className="block w-full group"
      // 🔥 3. الخدعة السحرية: التحميل المسبق بمجرد لمس الماوس
      onMouseEnter={() => router.prefetch(`/exams/${id}`)}
    >
      <div className="relative w-full h-[320px] overflow-hidden rounded-none bg-slate-200 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200">
        
        <Image 
          src={finalImage} 
          alt={title || "Diploma Image"} 
          fill 
          unoptimized={true}
          priority={true} 
          className="object-cover transition-transform duration-1000 group-hover:scale-110 z-0"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1617042375876-a13e36732a04";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-bg-transparent from-slate-900/60 to-transparent z-10" />

        <div className="absolute bottom-5 left-5 right-5 bg-[#175FFF]/40 backdrop-blur-md p-6 rounded-none border border-white/20 shadow-2xl z-20 transition-transform duration-300 group-hover:-translate-y-1">
          <h3 className="text-[15px] font-bold text-white mb-2 font-mono tracking-tight leading-tight uppercase group-hover:text-blue-200 transition-colors">
            {title}
          </h3>
          <p className="text-[11px] text-blue-50/90 font-mono leading-relaxed line-clamp-2 italic">
            {description}
          </p>
        </div>

        {/* سهم المؤشر عند الـ Hover */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-20">
            <div className="bg-white/95 p-2 rounded-full text-blue-600 shadow-lg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </div>
        </div>
      </div>
    </Link>
  );
}