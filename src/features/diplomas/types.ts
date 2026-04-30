export interface Diploma {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DiplomasResponse {
  data: Diploma[];
  pagination: Pagination;
}
