import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError, map } from 'rxjs';
import { apiUrl } from './api-url';
import { apiErrorMessage } from './http-error';
import { readLocalList, upsertLocal } from './local-store';

const LABOUR_KEY = 'slate.labour';

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
    return this.http.get<ApiLabourRecord[]>(this.endpoint).pipe(
      catchError(() => of([] as ApiLabourRecord[])),
      map((items) => {
        const extra = readLocalList<ApiLabourRecord>(LABOUR_KEY);
        const seen = new Set(items.map((item) => item.id).filter(Boolean));
        return [...items, ...extra.filter((item) => item.id && !seen.has(item.id))];
      }),
    );
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
      catchError((err) => {
        if (err?.status !== 404 && err?.status !== 405) {
          return throwError(() => new Error(apiErrorMessage(err, 'Could not save attendance to the database.')));
        }
        const saved: ApiLabourRecord = {
          id: crypto.randomUUID(),
          ...request,
        };
        upsertLocal(LABOUR_KEY, saved, (item) => item.id === saved.id);
        return of(saved);
      }),
    );
  }
}
