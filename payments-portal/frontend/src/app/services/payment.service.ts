import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Payment,
  CreatePaymentRequest,
  UpdatePaymentRequest
} from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/payments`;

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  create(request: CreatePaymentRequest): Observable<Payment> {
    return this.http
      .post<Payment>(this.baseUrl, request)
      .pipe(catchError(this.handleError));
  }

  update(id: number, request: UpdatePaymentRequest): Observable<Payment> {
    return this.http
      .put<Payment>(`${this.baseUrl}/${id}`, request)
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred.';
    if (error.status === 0) {
      message = 'Cannot reach the server. Please check your connection.';
    } else if (error.status === 400) {
      const errors = error.error?.errors;
      if (errors) {
        message = Object.values(errors).flat().join(' ');
      } else {
        message = error.error?.message ?? 'Invalid request.';
      }
    } else if (error.status === 404) {
      message = 'Payment not found.';
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later.';
    }
    return throwError(() => new Error(message));
  }
}
