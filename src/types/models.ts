// src/types/models.ts
export interface Diploma {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  description?: string;
  image?: string;
  imgURL?: string;
  immutable?: boolean;
  diplomaName?: string;
  questionsCount?: number;
  numberOfQuestions?: number;
  diploma?: Pick<Diploma, "_id" | "title">;
}

export interface Exam {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  image?: string;
  imgURL?: string;
  description?: string;
  desc?: string;
  duration?: number;
  immutable?: boolean;
  questionsCount?: number;
  numberOfQuestions?: number;
  diplomaId?: string;
  diplomaName?: string;
  diploma?: Pick<Diploma, "_id" | "title">;
  createdAt?: string;
}

export interface QuestionOption {
  text?: string;
  title?: string;
  isCorrect?: boolean;
}

export interface Question {
  _id: string;
  id?: string;
  title?: string;
  questionText?: string;
  answersCount?: number;
  options?: QuestionOption[];
  answers?: QuestionOption[];
}