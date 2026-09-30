import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  // Allow runtime configuration of API host. If not provided, use relative paths.
  private readonly API_BASE: string = (window as any).__env?.API_BASE ?? '';
  private readonly endpoint = (this.API_BASE || '') + '/api/projects';

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.endpoint).pipe(catchError(() => of([])));
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    // Normalize empty date strings to null so backend can bind to nullable DateTime
    const payload = {
      ...request,
      startDate: request.startDate || null,
      expectedCompletionDate: request.expectedCompletionDate || null,
    };
    return this.http.post<Project>(this.endpoint, payload).pipe(
      catchError((err) => {
        // Try to extract a helpful message from the API error response
        const message = err?.error?.message || err?.error || err?.message || 'Could not save the project to the database. Please try again.';
        return throwError(() => new Error(message));
      }),
    );
  }

  updateConstructionPlan(id: string, request: { foundationSystem: string; constructionPlanJson: string; progressPercent: number; actualCost: number }): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}/construction-plan`, request);
  }

  getConstructionPlan(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.endpoint}/${id}/construction-plan`);
  }
}
