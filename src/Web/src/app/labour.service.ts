import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { apiUrl } from './api-url';
import { apiErrorMessage } from './http-error';

export interface ApiLabourRecord {
  id: string;
  projectId: string;
  workerName: string;
  role: string;
  date: string;
  dailyWage: number;
  overtimeHours: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class LabourService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = apiUrl('/api/labour');

  getAttendance(): Observable<ApiLabourRecord[]> {
    return this.http.get<ApiLabourRecord[]>(this.endpoint).pipe(catchError(() => of([])));
  }

  recordAttendance(request: {
    projectId: string;
    workerName: string;
    role: string;
    date: string;
    dailyWage: number;
    overtimeHours: number;
    status: string;
  }): Observable<ApiLabourRecord> {
    return this.http.post<ApiLabourRecord>(this.endpoint, request).pipe(
      catchError((err) => throwError(() => new Error(apiErrorMessage(err, 'Could not save attendance to the database.')))),
    );
  }
}
