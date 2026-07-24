import { Component, OnInit } from '@angular/core';                          // Imports Component decorator and OnInit hook
import { CommonModule } from '@angular/common';                             // Imports common Angular directives like ngIf/ngFor
import { FormsModule } from '@angular/forms';                               // Imports FormsModule for ngModel two way binding
import { Student } from '../../models/student.model';                      // Imports the Student model
import { Subject } from '../../models/subject.model';                      // Imports the Subject model
import { ExamDtlsItem } from '../../models/exam-dtls-item.model';          // Imports the exam detail item model
import { ExamMaster, SaveExamRequest } from '../../models/exam-master.model'; // Imports exam master and request models
import { StudentService } from '../../services/student.service';          // Imports the student API service
import { SubjectService } from '../../services/subject.service';          // Imports the subject API service
import { ExamService } from '../../services/exam.service';                // Imports the exam API service

@Component({                                                                // Declares component metadata
  selector: 'app-exam-entry',                                              // Defines the child element selector
  standalone: true,                                                        // Marks this as a standalone component
  imports: [CommonModule, FormsModule],                                    // Imports directives needed by the template
  templateUrl: './exam-entry.component.html',                              // Points to the external HTML template
  styleUrl: './exam-entry.component.css'                                   // Points to the external CSS stylesheet
})
export class ExamEntryComponent implements OnInit {                        // Main exam result entry screen component

  students: Student[] = [];                                                // Holds the full list of students for autofill
  subjects: Subject[] = [];                                                // Holds the full list of subjects for autofill

  studentSearchText = '';                                                  // Bound text typed into the student autofill box
  selectedStudent: Student | null = null;                                  // Currently selected student object

  examYear: number | null = null;                                         // Bound exam year entered by the user

  subjectSearchText = '';                                                  // Bound text typed into the subject autofill box
  selectedSubject: Subject | null = null;                                  // Currently selected subject object
  marksInput: number | null = null;                                       // Bound marks entered for the selected subject

  examDtlsList: ExamDtlsItem[] = [];                                      // Working list of subject and marks rows added

  savedExam: ExamMaster | null = null;                                    // Holds the exam just saved, shown after submit
  allExamResults: ExamMaster[] = [];                                      // Holds every previously saved exam record

  errorMessage = '';                                                      // Holds the current validation or API error text
  successMessage = '';                                                    // Holds the current success confirmation text
  isSaving = false;                                                       // Tracks whether a save request is in progress

  editingMasterId: number | null = null;                                  // Holds the master id currently being edited, if any
  isDeletingId: number | null = null;                                     // Tracks which saved record is currently being deleted

  constructor(                                                             // Constructor injected with required services
    private studentService: StudentService,                               // Injects the student API service
    private subjectService: SubjectService,                               // Injects the subject API service
    private examService: ExamService                                      // Injects the exam API service
  ) { }

  // Loads students, subjects and saved exam results on component init    // Method level summary comment
  ngOnInit(): void {
    this.loadStudents();                                                   // Triggers loading of the student list
    this.loadSubjects();                                                   // Triggers loading of the subject list
    this.loadAllExamResults();                                             // Triggers loading of saved exam results
  }

  // Fetches all students from the backend for the autofill control       // Method level summary comment
  private loadStudents(): void {
    this.studentService.getAllStudents().subscribe({                      // Subscribes to the student list observable
      next: (data) => (this.students = data),                             // Assigns returned students on success
      error: () => (this.errorMessage = 'Unable to load student list.')   // Sets an error message on failure
    });
  }

  // Fetches all subjects from the backend for the autofill control       // Method level summary comment
  private loadSubjects(): void {
    this.subjectService.getAllSubjects().subscribe({                      // Subscribes to the subject list observable
      next: (data) => (this.subjects = data),                             // Assigns returned subjects on success
      error: () => (this.errorMessage = 'Unable to load subject list.')   // Sets an error message on failure
    });
  }

  // Fetches every saved exam record to populate the bottom results grid  // Method level summary comment
  private loadAllExamResults(): void {
    this.examService.getAllExamResults().subscribe({                      // Subscribes to the all results observable
      next: (data) => (this.allExamResults = data),                       // Assigns returned results on success
      error: () => (this.errorMessage = 'Unable to load saved exam results.') // Sets an error message on failure
    });
  }

  // Runs whenever the student autofill text changes, resolves selection  // Method level summary comment
  onStudentTextChange(): void {
    const match = this.students.find(                                     // Looks for a student matching typed text
      (s) => s.studentName.toLowerCase() === this.studentSearchText.toLowerCase() // Compares names case insensitively
    );
    this.selectedStudent = match ?? null;                                  // Sets selected student or null when no match
  }

  // Runs whenever the subject autofill text changes, resolves selection  // Method level summary comment
  onSubjectTextChange(): void {
    const match = this.subjects.find(                                     // Looks for a subject matching typed text
      (s) => s.subjectName.toLowerCase() === this.subjectSearchText.toLowerCase() // Compares names case insensitively
    );
    this.selectedSubject = match ?? null;                                  // Sets selected subject or null when no match
  }

  // Validates and appends the currently selected subject and marks       // Method level summary comment
  addSubjectRow(): void {
    this.clearMessages();                                                  // Clears any previously shown messages

    if (!this.selectedSubject) {                                          // Checks that a valid subject was selected
      this.errorMessage = 'Please select a valid subject from the list.'; // Sets error when subject is missing
      return;                                                              // Stops execution on validation failure
    }

    if (this.marksInput === null || this.marksInput < 0 || this.marksInput > 100) { // Validates marks range
      this.errorMessage = 'Marks must be between 0 and 100.';             // Sets error when marks are out of range
      return;                                                              // Stops execution on validation failure
    }

    const alreadyAdded = this.examDtlsList.some(                          // Checks for a duplicate subject in the table
      (row) => row.subjectId === this.selectedSubject!.subjectId
    );
    if (alreadyAdded) {                                                    // Checks the duplicate flag result
      this.errorMessage = 'This subject has already been added.';        // Sets error when subject is a duplicate
      return;                                                              // Stops execution on validation failure
    }

    this.examDtlsList.push({                                              // Appends a new row to the working list
      subjectId: this.selectedSubject.subjectId,                          // Copies the selected subject identifier
      subjectName: this.selectedSubject.subjectName,                      // Copies the selected subject name
      marks: this.marksInput                                              // Copies the entered marks value
    });

    this.subjectSearchText = '';                                          // Clears the subject autofill text box
    this.selectedSubject = null;                                          // Resets the selected subject reference
    this.marksInput = null;                                               // Clears the marks input box
  }

  // Removes a subject row from the working list at the given index       // Method level summary comment
  removeSubjectRow(index: number): void {
    this.examDtlsList.splice(index, 1);                                   // Removes one row from the working list
  }

  // Computes the running total of marks across all added subjects        // Method level summary comment
  get totalMark(): number {
    return this.examDtlsList.reduce((sum, row) => sum + row.marks, 0);    // Sums the marks field across all rows
  }

  // Computes a live preview of the pass or fail status before saving     // Method level summary comment
  get passOrFailPreview(): string {
    if (this.examDtlsList.length === 0) {                                // Checks if no subjects have been added yet
      return '-';                                                         // Shows a placeholder when nothing is added
    }
    const anyBelowPassMark = this.examDtlsList.some((row) => row.marks < 25); // Checks if any subject is below 25
    return anyBelowPassMark ? 'FAIL' : 'PASS';                            // Returns FAIL or PASS based on the check
  }

  // Validates the full form and submits the exam to the backend API      // Method level summary comment
  saveExam(): void {
    this.clearMessages();                                                  // Clears any previously shown messages

    if (!this.selectedStudent) {                                          // Checks that a valid student was selected
      this.errorMessage = 'Please select a valid student from the list.'; // Sets error when student is missing
      return;                                                              // Stops execution on validation failure
    }

    if (!this.examYear || this.examYear < 2000 || this.examYear > 2100) { // Validates the exam year range
      this.errorMessage = 'Please enter a valid exam year.';              // Sets error when exam year is invalid
      return;                                                              // Stops execution on validation failure
    }

    if (this.examDtlsList.length === 0) {                                // Checks that at least one subject was added
      this.errorMessage = 'Please add at least one subject with marks.'; // Sets error when no subjects were added
      return;                                                              // Stops execution on validation failure
    }

    const request: SaveExamRequest = {                                    // Builds the request payload for the API
      studentId: this.selectedStudent.studentId,                          // Supplies the selected student identifier
      examYear: this.examYear,                                            // Supplies the entered exam year
      examDtls: this.examDtlsList                                         // Supplies the working list of subject marks
    };

    this.isSaving = true;                                                 // Flags that a save request has started

    if (this.editingMasterId !== null) {                                  // Checks whether an existing record is being edited
      this.examService.updateExam(this.editingMasterId, request).subscribe({ // Subscribes to the update exam observable
        next: (response) => this.handleSaveResponse(response),           // Reuses the shared success/failure handler
        error: (err) => this.handleSaveError(err)                        // Reuses the shared HTTP error handler
      });
      return;                                                              // Stops here, update branch handles the rest
    }

    this.examService.saveExam(request).subscribe({                        // Subscribes to the save exam observable
      next: (response) => this.handleSaveResponse(response),              // Reuses the shared success/failure handler
      error: (err) => this.handleSaveError(err)                           // Reuses the shared HTTP error handler
    });
  }

  // Handles a successful HTTP response from either save or update calls   // Method level summary comment
  private handleSaveResponse(response: { success: boolean; message: string; data: ExamMaster }): void {
    this.isSaving = false;                                                 // Clears the saving in progress flag
    if (!response.success) {                                               // Checks if backend reported a failure
      this.errorMessage = response.message;                               // Shows the backend validation message
      return;                                                              // Stops further processing on failure
    }
    this.successMessage = response.message;                               // Shows the backend success message
    this.savedExam = response.data;                                       // Stores the saved exam for display
    this.resetForm();                                                     // Resets the entry form for the next record
    this.loadAllExamResults();                                            // Refreshes the saved results grid
  }

  // Handles an HTTP level error response from either save or update calls // Method level summary comment
  private handleSaveError(err: any): void {
    this.isSaving = false;                                                 // Clears the saving in progress flag
    this.errorMessage = err?.error?.message ?? 'Failed to save exam details.'; // Extracts a friendly error message
  }

  // Loads an existing saved exam back into the form fields for editing    // Method level summary comment
  startEditExam(exam: ExamMaster): void {
    this.clearMessages();                                                  // Clears any previously shown messages
    this.savedExam = null;                                                 // Hides the previous just-saved confirmation card
    this.editingMasterId = exam.masterId;                                  // Marks this master id as currently being edited
    this.studentSearchText = exam.studentName;                             // Prefills the student autofill text box
    this.selectedStudent = {                                               // Reconstructs the selected student from the record
      studentId: exam.studentId,                                          // Copies the student identifier
      studentName: exam.studentName,                                      // Copies the student name
      mail: exam.mail                                                     // Copies the student email
    };
    this.examYear = exam.examYear;                                        // Prefills the exam year input box
    this.examDtlsList = exam.examDtls.map((row) => ({                     // Prefills the working subject marks list
      subjectId: row.subjectId,                                           // Copies the subject identifier
      subjectName: row.subjectName,                                       // Copies the subject name
      marks: row.marks                                                    // Copies the marks scored
    }));
    this.subjectSearchText = '';                                          // Clears the subject autofill text box
    this.selectedSubject = null;                                          // Resets the selected subject reference
    this.marksInput = null;                                               // Clears the marks input box
  }

  // Cancels an in-progress edit and clears the form back to a blank state // Method level summary comment
  cancelEdit(): void {
    this.clearMessages();                                                  // Clears any previously shown messages
    this.resetForm();                                                      // Clears all form fields including the edit id
  }

  // Deletes a saved exam record after the user confirms the action        // Method level summary comment
  deleteExam(exam: ExamMaster): void {
    this.clearMessages();                                                  // Clears any previously shown messages
    const confirmed = window.confirm(                                     // Asks the user to confirm the destructive action
      `Delete the exam record for ${exam.studentName} (${exam.examYear})?`
    );
    if (!confirmed) {                                                      // Checks whether the user cancelled the confirm
      return;                                                              // Stops here when the user did not confirm
    }

    this.isDeletingId = exam.masterId;                                    // Flags this record as currently being deleted
    this.examService.deleteExam(exam.masterId).subscribe({                 // Subscribes to the delete exam observable
      next: (response) => {                                                // Handles a successful HTTP response
        this.isDeletingId = null;                                          // Clears the deleting in progress flag
        if (!response.success) {                                           // Checks if backend reported a failure
          this.errorMessage = response.message;                           // Shows the backend validation message
          return;                                                          // Stops further processing on failure
        }
        this.successMessage = response.message;                          // Shows the backend success message
        if (this.editingMasterId === exam.masterId) {                     // Checks if the deleted record was being edited
          this.resetForm();                                               // Clears the form since its target no longer exists
        }
        this.loadAllExamResults();                                       // Refreshes the saved results grid
      },
      error: (err) => {                                                   // Handles an HTTP level error response
        this.isDeletingId = null;                                         // Clears the deleting in progress flag
        this.errorMessage = err?.error?.message ?? 'Failed to delete exam record.'; // Extracts a friendly error message
      }
    });
  }

  // Resets the entry form fields after a successful save or a cancel      // Method level summary comment
  private resetForm(): void {
    this.studentSearchText = '';                                          // Clears the student autofill text box
    this.selectedStudent = null;                                          // Resets the selected student reference
    this.examYear = null;                                                 // Clears the exam year input box
    this.subjectSearchText = '';                                          // Clears the subject autofill text box
    this.selectedSubject = null;                                          // Resets the selected subject reference
    this.marksInput = null;                                               // Clears the marks input box
    this.examDtlsList = [];                                               // Empties the working subject marks list
    this.editingMasterId = null;                                          // Clears the currently edited master id
  }

  // Clears any previously shown error or success messages                // Method level summary comment
  private clearMessages(): void {
    this.errorMessage = '';                                               // Clears the current error message
    this.successMessage = '';                                             // Clears the current success message
  }
}
