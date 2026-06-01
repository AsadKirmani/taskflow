export interface ApiResponse<T> {
  baseUrl: string;
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}