import AdminExamTable from "@/features/admin/components/AdminExamTable";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

// بنستخدم searchParams عشان نلقط الـ ID لو جاي من فلتر أو لينك خارجي
export default async function AdminExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ diploma?: string }>;
}) {
  // 🔥 في Next.js 15+ لازم تعمل await للـ searchParams
  const { diploma } = await searchParams;

  const session = await getServerSession(authOptions);
  const token = (session as any)?.accessToken;

  let exams = [];

  try {
    // لو فيه ID دبلومة هنفلتر، لو مفيش هنجيب كله
    const url = diploma 
      ? `${BASE_URL}/api/exams?diploma=${diploma}`
      : `${BASE_URL}/api/exams`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (res.ok) {
      const responseData = await res.json();
      // استخراج الداتا حسب الـ Payload بتاع السيرفر
      exams = responseData.payload?.exams || responseData.payload?.data || responseData.payload || [];
    }
  } catch (error) {
    console.error("Error fetching exams:", error);
  }

  return (
    <div className="w-full">
      {/* @ts-expect-error: AdminExamTable expects 'exams' prop but its type is not declared in the file */} 
      <AdminExamTable exams={Array.isArray(exams) ? exams : []} />
 
    </div>
  );
}
