import { Injectable } from '@angular/core';                                 // Imports the Injectable decorator
import { HttpClient } from '@angular/common/http';                          // Imports Angular HttpClient for API calls
import { Observable } from 'rxjs';                                          // Imports Observable type for async streams
import { map } from 'rxjs/operators';                                       // Imports the map operator for response mapping
import { Subject } from '../models/subject.model';                         // Imports the Subject model
import { ApiResponse } from '../models/api-response.model';                // Imports the ApiResponse wrapper model
import { environment } from '../../environments/environment';              // Imports environment configuration values

@Injectable({ providedIn: 'root' })                                        // Registers this service as a singleton
export class SubjectService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Subjects`;          // Builds the base URL for subject endpoints

  constructor(private http: HttpClient) { }                                // Injects HttpClient via constructor

  // Fetches all subjects used to populate the subject autofill control    // Method level summary comment
  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<ApiResponse<Subject[]>>(this.apiUrl).pipe(        // Issues GET request to the subjects endpoint
      map(response => response.data)                                      // Unwraps the ApiResponse to return only data
    );
  }
}
