import { Injectable } from '@angular/core';                                 // Imports the Injectable decorator
import { HttpClient } from '@angular/common/http';                          // Imports Angular HttpClient for API calls
import { Observable } from 'rxjs';                                          // Imports Observable type for async streams
import { map } from 'rxjs/operators';                                       // Imports the map operator for response mapping
import { Student } from '../models/student.model';                         // Imports the Student model
import { ApiResponse } from '../models/api-response.model';                // Imports the ApiResponse wrapper model
import { environment } from '../../environments/environment';              // Imports environment configuration values

@Injectable({ providedIn: 'root' })                                        // Registers this service as a singleton
export class StudentService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Students`;          // Builds the base URL for student endpoints

  constructor(private http: HttpClient) { }                                // Injects HttpClient via constructor

  // Fetches all students used to populate the student autofill control    // Method level summary comment
  getAllStudents(): Observable<Student[]> {
    return this.http.get<ApiResponse<Student[]>>(this.apiUrl).pipe(        // Issues GET request to the students endpoint
      map(response => response.data)                                      // Unwraps the ApiResponse to return only data
    );
  }
}
