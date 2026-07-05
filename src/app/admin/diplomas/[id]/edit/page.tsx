import CreateDiplomaForm from "@/features/admin/components/CreateDiplomaForm";
import { serverFetch } from "@/lib/server-fetch";
import type { Diploma } from "@/types/models";

export default async function EditDiplomaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let initialData: Diploma | null = null;

  try {
    const res = await serverFetch(`/api/diplomas/${id}`);

    if (res.ok) {
      const responseData = await res.json();
      initialData =
        responseData.payload?.data || responseData.payload || responseData;
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
