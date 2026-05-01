import CreateDiplomaForm from "@/features/admin/components/CreateDiplomaForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import type { AppSession } from "@/types/auth";
import type { Diploma } from "@/types/models";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://exam-app.elevate-bootcamp.cloud";

// 1. التعديل الأول: خلينا نوع الـ params يكون Promise
export default async function EditDiplomaPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. التعديل التاني: عملنا await للـ params قبل ما نطلع منها الـ id
  const { id } = await params;
  
  const session = await getServerSession(authOptions);
  const token = (session as AppSession | null)?.accessToken;

  let initialData: Diploma | null = null;

  try {
    const res = await fetch(`${BASE_URL}/api/diplomas/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const responseData = await res.json();
      initialData = responseData.payload?.data || responseData.payload || responseData;
    }
  } catch {
    initialData = null;
  }

  return (
    <div className="w-full">
      <CreateDiplomaForm initialData={initialData} isEditMode={true} />
    </div>
  );
}