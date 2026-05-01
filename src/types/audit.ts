export type AuditLog = {
  id: string;
  createdAt: string;
  actorUserId: string;
  actorUsername: string;
  actorEmail: string;
  actorRole: string;
  category: string;
  action: string;
  entityType: string;
  entityId: string;
  httpMethod: string;
  ipAddress?: string;
  metadata?: AuditMetadata;
};

export type AuditMetadata = {
  keys?: string[];
  title?: string;
  description?: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
};

export type Metadata = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};