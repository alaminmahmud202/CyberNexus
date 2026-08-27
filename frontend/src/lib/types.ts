export interface StoredUser {
  id: string;
  name: string;
  email: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  status: string;
  taskId?: string | null;
  createdAt: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  serviceType: string;
  input: string;
  result: Record<string, unknown>;
  status: string;
  createdAt: string;
  durationMs?: number | null;
}

export interface ReportContent {
  report_version: number;
  generated_at: string;
  scan: {
    id: string;
    service_type: string;
    input: string;
    status: string;
    created_at: string;
  };
  result: Record<string, unknown>;
  summary: {
    target: string;
    outcome: string;
    risk_status: string;
  };
}

export interface ReportRecord {
  id: string;
  userId: string;
  scanId: string;
  serviceType: string;
  title: string;
  content: ReportContent;
  createdAt: string;
}

export interface ExplanationResponse {
  status: string;
  model?: string | null;
  explanation: string;
  error?: { code: string; message: string } | null;
}

export interface TaskRecord {
  id: string;
  userId: string;
  type: string;
  status: string;
  result?: Record<string, unknown> | null;
  error?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
