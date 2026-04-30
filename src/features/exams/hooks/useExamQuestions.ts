import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export const useExamQuestions = (examId: string) => {
  return useQuery({
    queryKey: ["exam-questions", examId],
    queryFn: async () => {
      // بنكلم السيرفر نجيب أسئلة الامتحان
      const response = await api.get(`/api/questions/exam/${examId}`);
      // بنسحب مصفوفة الأسئلة من الرد
      return response.data?.payload?.questions || response.data?.data || response.data;
    },
    // الماتور مش هيشتغل غير لو في رقم امتحان حقيقي
    enabled: !!examId && examId !== "undefined", 
    // ⚠️ التعديل هنا: بنوقف إعادة المحاولة التلقائية عشان لو الامتحان فاضي يظهر للمستخدم رسالة فوراً
    retry: false,
  });
};
