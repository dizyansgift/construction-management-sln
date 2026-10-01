import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError, switchMap } from 'rxjs';
import { apiUrl } from './api-url';
import { apiErrorMessage } from './http-error';

export const PLAN_BACKUP_CATEGORY = '__construction_plan__';
export const PLAN_BACKUP_VENDOR = '__slate_plan__';

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
  startDate?: string;
  projectManager?: string;
  description?: string;
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

export interface UpdateProjectRequest {
  name: string;
  clientName?: string;
  siteAddress: string;
  startDate: string | null;
  expectedCompletionDate: string | null;
  estimatedBudget: number;
  status: string;
  progressPercent: number;
  projectManager: string;
  description: string;
}

export interface ConstructionPlanPayload {
  foundationSystem: string;
  constructionPlanJson: string;
  progressPercent: number;
  actualCost: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = apiUrl('/api/projects');
  private readonly expensesEndpoint = apiUrl('/api/expenses');

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
      catchError((err) => throwError(() => new Error(apiErrorMessage(err, 'Could not save the project to the database.')))),
    );
  }

  updateProject(id: string, request: UpdateProjectRequest): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/${id}`, {
      ...request,
      startDate: toIsoDate(request.startDate),
      expectedCompletionDate: toIsoDate(request.expectedCompletionDate),
    }).pipe(
      catchError((err) => throwError(() => new Error(apiErrorMessage(err, 'Could not update the project.')))),
    );
  }

  updateConstructionPlan(id: string, request: ConstructionPlanPayload): Observable<void> {
    localStorage.setItem(planKey(id), JSON.stringify(request));
    const url = `${this.endpoint}/${id}/construction-plan`;
    return this.http.put<void>(url, request).pipe(
      catchError((err) => {
        if (err?.status === 404 || err?.status === 405) {
          return this.http.post<void>(url, request).pipe(catchError(() => this.savePlanBackup(id, request)));
        }
        return this.savePlanBackup(id, request);
      }),
    );
  }

  getConstructionPlan(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.endpoint}/${id}/construction-plan`);
  }

  applyPlanBackups<T extends { category?: string; vendor?: string; description?: string; projectId?: string }>(
    projects: Project[],
    expenses: T[],
  ): Project[] {
    const latest = new Map<string, ConstructionPlanPayload>();
    for (const expense of expenses) {
      if (!isConstructionPlanBackup(expense) || !expense.projectId) continue;
      const parsed = planFromBackupExpense(expense);
      if (parsed) latest.set(expense.projectId, parsed);
    }
    return projects.map((project) => {
      const backup = latest.get(project.id) ?? readLocalPlan(project.id);
      if (!backup) return project;
      return {
        ...project,
        foundationSystem: backup.foundationSystem || project.foundationSystem,
        constructionPlanJson: backup.constructionPlanJson,
        progressPercent: backup.progressPercent || project.progressPercent,
        actualCost: backup.actualCost || project.actualCost,
      };
    });
  }

  private savePlanBackup(id: string, request: ConstructionPlanPayload): Observable<void> {
    return this.http
      .post(this.expensesEndpoint, {
        projectId: id,
        phaseId: '',
        category: PLAN_BACKUP_CATEGORY,
        amount: 0.01,
        date: new Date().toISOString().slice(0, 10),
        vendor: PLAN_BACKUP_VENDOR,
        description: JSON.stringify(request),
        paymentMethod: 'System',
      })
      .pipe(
        switchMap(() => of(undefined)),
        catchError(() => {
          localStorage.setItem(planKey(id), JSON.stringify(request));
          return of(undefined);
        }),
      );
  }
}

export function isConstructionPlanBackup(expense: { category?: string; vendor?: string }): boolean {
  return expense.category === PLAN_BACKUP_CATEGORY || expense.vendor === PLAN_BACKUP_VENDOR;
}

export function planFromBackupExpense(expense: { description?: string }): ConstructionPlanPayload | null {
  try {
    const parsed = JSON.parse(expense.description || '') as ConstructionPlanPayload;
    return parsed?.constructionPlanJson ? parsed : null;
  } catch {
    return null;
  }
}

function planKey(id: string): string {
  return `slate.plan.${id}`;
}

function readLocalPlan(id: string): ConstructionPlanPayload | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(planKey(id)) || 'null') as ConstructionPlanPayload | null;
    return parsed?.constructionPlanJson ? parsed : null;
  } catch {
    return null;
  }
}

function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
