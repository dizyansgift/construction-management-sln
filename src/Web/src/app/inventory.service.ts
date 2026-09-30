import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError, map } from 'rxjs';
import { apiUrl } from './api-url';
import { apiErrorMessage } from './http-error';
import { readLocalList, upsertLocal } from './local-store';

const MATERIALS_KEY = 'slate.materials';
const BOQ_KEY = 'slate.boq';

export interface ApiMaterial {
  id: string;
  projectId: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  supplierName: string;
}

export interface ApiBoqItem {
  id: string;
  projectId: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  estimatedRate: number;
  actualRate: number;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly materialsEndpoint = apiUrl('/api/materials');
  private readonly boqEndpoint = apiUrl('/api/boq-items');

  getMaterials(): Observable<ApiMaterial[]> {
    return this.http.get<ApiMaterial[]>(this.materialsEndpoint).pipe(
      catchError(() => of([] as ApiMaterial[])),
      map((items) => mergeById(items, readLocalList<ApiMaterial>(MATERIALS_KEY))),
    );
  }

  receiveMaterial(request: {
    projectId: string;
    name: string;
    category: string;
    unit: string;
    quantity: number;
    minimumStock: number;
    unitPrice: number;
    supplierName: string;
  }): Observable<ApiMaterial> {
    return this.http.post<ApiMaterial>(this.materialsEndpoint, request).pipe(
      catchError((err) => {
        if (err?.status !== 404 && err?.status !== 405) {
          return throwError(() => new Error(apiErrorMessage(err, 'Could not save material to the database.')));
        }
        const existing = readLocalList<ApiMaterial>(MATERIALS_KEY).find(
          (item) => item.projectId === request.projectId && item.name.toLowerCase() === request.name.toLowerCase(),
        );
        const saved: ApiMaterial = existing
          ? {
              ...existing,
              currentStock: existing.currentStock + request.quantity,
              minimumStock: request.minimumStock,
              unitPrice: request.unitPrice,
              supplierName: request.supplierName,
            }
          : {
              id: crypto.randomUUID(),
              projectId: request.projectId,
              name: request.name,
              category: request.category,
              unit: request.unit,
              currentStock: request.quantity,
              minimumStock: request.minimumStock,
              unitPrice: request.unitPrice,
              supplierName: request.supplierName,
            };
        return of(upsertLocal(MATERIALS_KEY, saved, (item) => item.projectId === saved.projectId && item.name.toLowerCase() === saved.name.toLowerCase()));
      }),
    );
  }

  getBoqItems(): Observable<ApiBoqItem[]> {
    return this.http.get<ApiBoqItem[]>(this.boqEndpoint).pipe(
      catchError(() => of([] as ApiBoqItem[])),
      map((items) => mergeById(items, readLocalList<ApiBoqItem>(BOQ_KEY))),
    );
  }

  createBoqItem(request: {
    projectId: string;
    category: string;
    description: string;
    unit: string;
    quantity: number;
    estimatedRate: number;
  }): Observable<ApiBoqItem> {
    return this.http.post<ApiBoqItem>(this.boqEndpoint, request).pipe(
      catchError((err) => {
        if (err?.status !== 404 && err?.status !== 405) {
          return throwError(() => new Error(apiErrorMessage(err, 'Could not save BOQ item to the database.')));
        }
        const saved: ApiBoqItem = {
          id: crypto.randomUUID(),
          projectId: request.projectId,
          category: request.category,
          description: request.description,
          unit: request.unit,
          quantity: request.quantity,
          estimatedRate: request.estimatedRate,
          actualRate: request.estimatedRate,
        };
        upsertLocal(BOQ_KEY, saved, (item) => item.id === saved.id);
        return of(saved);
      }),
    );
  }
}

function mergeById<T extends { id?: string }>(primary: T[], extra: T[]): T[] {
  const seen = new Set(primary.map((item) => item.id).filter(Boolean));
  return [...primary, ...extra.filter((item) => item.id && !seen.has(item.id))];
}
