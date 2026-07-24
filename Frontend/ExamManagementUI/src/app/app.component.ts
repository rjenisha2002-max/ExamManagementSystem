import { Component } from '@angular/core';                                  // Imports the Component decorator
import { ExamEntryComponent } from './components/exam-entry/exam-entry.component'; // Imports the exam entry screen

@Component({                                                                // Declares component metadata
  selector: 'app-root',                                                    // Defines the root element selector
  standalone: true,                                                        // Marks this as a standalone component
  imports: [ExamEntryComponent],                                           // Imports the child exam entry component
  templateUrl: './app.component.html',                                     // Points to the external HTML template
  styleUrl: './app.component.css'                                          // Points to the external CSS stylesheet
})
export class AppComponent {                                                 // Root shell component class
  title = 'Exam Management System';                                       // Application title shown in the header bar
}
