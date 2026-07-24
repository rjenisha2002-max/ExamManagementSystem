import { Injectable } from '@angular/core';                                 // Imports the Injectable decorator
import { HttpClient } from '@angular/common/http';                          // Imports Angular HttpClient for API calls
import { Observable } from 'rxjs';                                          // Imports Observable type for async streams
import { map } from 'rxjs/operators';                                       // Imports the map operator for response mapping
import { ExamMaster, SaveExamRequest } from '../models/exam-master.model'; // Imports exam related models
import { ApiResponse } from '../models/api-response.model';                // Imports the ApiResponse wrapper model
import { environment } from '../../environments/environment';              // Imports environment configuration values

@Injectable({ providedIn: 'root' })                                        // Registers this service as a singleton
export class ExamService {
  private readonly apiUrl = `${environment.apiBaseUrl}/Exam`;              // Builds the base URL for exam endpoints

  constructor(private http: HttpClient) { }                                // Injects HttpClient via constructor

  // Sends the save request and returns the saved exam with details        // Method level summary comment
  saveExam(request: SaveExamRequest): Observable<ApiResponse<ExamMaster>> {
    return this.http.post<ApiResponse<ExamMaster>>(                        // Issues POST request to the save endpoint
      `${this.apiUrl}/Save`, request                                       // Supplies the target URL and request body
    );
  }

  // Fetches a single saved exam along with its subject wise details       // Method level summary comment
  getExamByMasterId(masterId: number): Observable<ExamMaster> {
    return this.http.get<ApiResponse<ExamMaster>>(                         // Issues GET request to fetch one exam
      `${this.apiUrl}/${masterId}`                                         // Supplies the master id in the route
    ).pipe(
      map(response => response.data)                                      // Unwraps the ApiResponse to return only data
    );
  }

  // Fetches every saved exam record for the results grid                  // Method level summary comment
  getAllExamResults(): Observable<ExamMaster[]> {
    return this.http.get<ApiResponse<ExamMaster[]>>(                       // Issues GET request to fetch all exams
      `${this.apiUrl}/All`                                                 // Targets the All results endpoint
    ).pipe(
      map(response => response.data)                                      // Unwraps the ApiResponse to return only data
    );
  }

  // Sends the update request for an existing exam master record           // Method level summary comment
  updateExam(masterId: number, request: SaveExamRequest): Observable<ApiResponse<ExamMaster>> {
    return this.http.put<ApiResponse<ExamMaster>>(                         // Issues PUT request to the update endpoint
      `${this.apiUrl}/Update/${masterId}`, request                         // Supplies the master id and updated payload
    );
  }

  // Sends the delete request for an existing exam master record           // Method level summary comment
  deleteExam(masterId: number): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(                        // Issues DELETE request to the delete endpoint
      `${this.apiUrl}/Delete/${masterId}`                                  // Supplies the master id in the route
    );
  }
}
