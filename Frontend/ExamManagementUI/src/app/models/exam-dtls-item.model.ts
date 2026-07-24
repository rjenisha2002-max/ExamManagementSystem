// Represents a single subject and marks row within an exam                  // File level summary comment
export interface ExamDtlsItem {
  dtlsId?: number;                                                          // Identifier of the saved detail row, optional
  subjectId: number;                                                        // Identifier of the selected subject
  subjectName: string;                                                      // Display name of the selected subject
  marks: number;                                                            // Marks scored by the student, 0 to 100
}
