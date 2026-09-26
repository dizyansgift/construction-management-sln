import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface ApiExpense {
  id: string;
  projectId: string;
  phaseId: string | null;
  category: string;
  amount: number;
  date: string;
  vendor: string;
  description: string;
  paymentMethod: string;
}

export interface ApiPayment {
  id: string;
  projectId: string;
  phaseId: string | null;
  paymentType: string;
  partyName: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  dueDate: string | null;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly http = inject(HttpClient);
  private readonly expensesEndpoint = '/api/expenses';
  private readonly paymentsEndpoint = '/api/payments';

  getExpenses(): Observable<ApiExpense[]> {
    return this.http.get<ApiExpense[]>(this.expensesEndpoint).pipe(catchError(() => of([])));
  }

  createExpense(request: {
    projectId: string;
    phaseId: string;
    category: string;
    amount: number;
    date: string;
    vendor: string;
    description: string;
    paymentMethod: string;
  }): Observable<ApiExpense> {
    return this.http.post<ApiExpense>(this.expensesEndpoint, request);
  }

  getPayments(): Observable<ApiPayment[]> {
    return this.http.get<ApiPayment[]>(this.paymentsEndpoint).pipe(catchError(() => of([])));
  }

  createPayment(request: {
    projectId: string;
    phaseId: string;
    paymentType: string;
    partyName: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string | null;
    status: string;
  }): Observable<ApiPayment> {
    return this.http.post<ApiPayment>(this.paymentsEndpoint, request);
  }
}
