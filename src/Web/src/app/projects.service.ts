import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { apiUrl } from './api-url';

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  clientName: string;
  siteAddress: string;
  estimatedBudget: number;
  actualCost: number;
  progressPercent: number;
  status: string;
  expectedCompletionDate?: string;
  foundationSystem?: string;
  constructionPlanJson?: string | null;
}

export interface CreateProjectRequest {
  projectCode: string;
  name: string;
  clientName: string;
  clientContact: string;
  siteAddress: string;
  startDate: string | null;
  expectedCompletionDate: string | null;
  estimatedBudget: number;
  projectManager: string;
  description: string;
  foundationSystem?: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = apiUrl('/api/projects');

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.endpoint).pipe(catchError(() => of([])));
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    const payload = {
      ...request,
      startDate: toIsoDate(request.startDate),
      expectedCompletionDate: toIsoDate(request.expectedCompletionDate),
    };
    return this.http.post<Project>(this.endpoint, payload).pipe(
      catchError((err) => {
        const message = err?.error?.message || err?.error?.detail || err?.error || err?.message || 'Could not save the project to the database. Please try again.';
        return throwError(() => new Error(typeof message === 'string' ? message : 'Could not save the project to the database. Please try again.'));
      }),
    );
  }

  updateConstructionPlan(id: string, request: { foundationSystem: string; constructionPlanJson: string; progressPercent: number; actualCost: number }): Observable<void> {
    const url = `${this.endpoint}/${id}/construction-plan`;
    const toError = (err: { status?: number; error?: { detail?: string; message?: string } }) => {
      const status = err?.status;
      const message =
        err?.error?.detail ||
        err?.error?.message ||
        (status === 404
          ? 'Construction plan API is not available on the deployed server. Redeploy the API, then try again.'
          : 'Could not save construction plan to the database.');
      return throwError(() => new Error(typeof message === 'string' ? message : 'Could not save construction plan to the database.'));
    };
    return this.http.put<void>(url, request).pipe(
      catchError((err) => (err?.status === 404 || err?.status === 405 ? this.http.post<void>(url, request) : toError(err))),
      catchError((err) => toError(err)),
    );
  }

  getConstructionPlan(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.endpoint}/${id}/construction-plan`);
  }
}

function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
