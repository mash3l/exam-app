import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const useExams = (diplomaId: string) => {
  return useQuery({
    queryKey: ["exams", diplomaId],
    queryFn: async () => {
      // بنكلم السيرفر ونبعتله رقم الدبلومة عشان يفلتر الامتحانات
      const response = await api.get("/api/exams", {
        params: { diplomaId } 
      });
      // الداتا جاية جوا object اسمه data بناءً على كلامك
      return response.data; 
    },
    enabled: !!diplomaId && diplomaId !== "undefined",
  });
};
