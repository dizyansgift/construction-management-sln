import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

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
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/projects';

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.endpoint).pipe(catchError(() => of([])));
  }

  createProject(request: { projectCode: string; name: string; clientName: string; clientContact: string; siteAddress: string; startDate: string; expectedCompletionDate: string; estimatedBudget: number; projectManager: string; description: string }): Observable<Project> {
    return this.http.post<Project>(this.endpoint, request);
  }
}
