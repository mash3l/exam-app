import DiplomaForm from "@/features/admin/components/CreateDiplomaForm";

export default function CreateDiplomaPage() {
  // بننادي الكومبوننت ونقوله إننا مش في وضع التعديل
  return <DiplomaForm isEditMode={false} />;
}