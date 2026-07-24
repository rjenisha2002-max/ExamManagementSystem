import { ExamDtlsItem } from './exam-dtls-item.model';                      // Imports the exam detail item model

// Represents the payload sent to the ExamController Save endpoint           // File level summary comment
export interface SaveExamRequest {
  studentId: number;                                                        // Identifier of the selected student
  examYear: number;                                                         // Year in which the exam was conducted
  examDtls: ExamDtlsItem[];                                                 // Collection of subject wise marks submitted
}

// Represents a saved exam record returned from the ExamController          // File level summary comment
export interface ExamMaster {
  masterId: number;                                                        // Unique identifier of the exam master row
  studentId: number;                                                       // Identifier of the associated student
  studentName: string;                                                     // Display name of the associated student
  mail: string;                                                            // Email address of the associated student
  examYear: number;                                                        // Year in which the exam was conducted
  totalMark: number;                                                       // Calculated total of all subject marks
  passOrFail: string;                                                      // Derived overall PASS or FAIL status
  createTime: string;                                                      // Timestamp of when the record was created
  examDtls: ExamDtlsItem[];                                                // Collection of subject wise mark rows
}
