import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { apiUrl } from './api-url';
import { apiErrorMessage } from './http-error';

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
    return this.http.get<ApiMaterial[]>(this.materialsEndpoint).pipe(catchError(() => of([])));
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
      catchError((err) => throwError(() => new Error(apiErrorMessage(err, 'Could not save material to the database.')))),
    );
  }

  getBoqItems(): Observable<ApiBoqItem[]> {
    return this.http.get<ApiBoqItem[]>(this.boqEndpoint).pipe(catchError(() => of([])));
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
      catchError((err) => throwError(() => new Error(apiErrorMessage(err, 'Could not save BOQ item to the database.')))),
    );
  }
}
