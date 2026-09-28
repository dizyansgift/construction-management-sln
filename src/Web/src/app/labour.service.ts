import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

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
  private readonly endpoint = '/api/labour';

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
    return this.http.post<ApiLabourRecord>(this.endpoint, request);
  }
}
