// Generic wrapper matching the backend ApiResponse<T> shape                 // File level summary comment
export interface ApiResponse<T> {
  success: boolean;                                                         // Indicates whether the operation succeeded
  message: string;                                                          // Human readable success or error message
  data: T;                                                                  // Actual payload returned by the endpoint
}
