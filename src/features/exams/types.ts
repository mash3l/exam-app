export interface Exam {
  /** Some API responses use `_id` instead of `id`. */
  _id?: string;
  id: string;
  title: string;
  description: string;
  image: string;
  duration: number; // الوقت بالدقايق
  diplomaId?: string;
  questionsCount?: number; 
  createdAt?: string;
}
