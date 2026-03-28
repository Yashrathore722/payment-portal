import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { Payment, CreatePaymentRequest, UpdatePaymentRequest } from '../models/payment.model';
import { environment } from '../../environments/environment';

const BASE = `${environment.apiBaseUrl}/payments`;

const mockPayment: Payment = {
  id: 1,
  reference: 'PAY-20250910-0001',
  amount: 100,
  currency: 'USD',
  createdAt: '2025-09-10T10:00:00Z',
  clientRequestId: 'test-guid-001'
};

describe('PaymentService', () => {
  let service: PaymentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });
    service = TestBed.inject(PaymentService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll()', () => {
    it('should GET /api/payments and return payment array', () => {
      const payments = [mockPayment];
      service.getAll().subscribe(result => {
        expect(result).toEqual(payments);
      });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      req.flush(payments);
    });
  });

  describe('create()', () => {
    it('should POST /api/payments with request body', () => {
      const createReq: CreatePaymentRequest = {
        clientRequestId: 'new-guid',
        amount: 100,
        currency: 'USD'
      };
      service.create(createReq).subscribe(result => {
        expect(result).toEqual(mockPayment);
      });
      const req = http.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createReq);
      req.flush(mockPayment);
    });
  });

  describe('update()', () => {
    it('should PUT /api/payments/:id with updated fields', () => {
      const updateReq: UpdatePaymentRequest = { amount: 200, currency: 'EUR' };
      const updated = { ...mockPayment, amount: 200, currency: 'EUR' as any };

      service.update(1, updateReq).subscribe(result => {
        expect(result.amount).toBe(200);
        expect(result.currency).toBe('EUR');
      });
      const req = http.expectOne(`${BASE}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateReq);
      req.flush(updated);
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/payments/:id', () => {
      service.delete(1).subscribe(result => {
        expect(result).toBeUndefined();
      });
      const req = http.expectOne(`${BASE}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  describe('error handling', () => {
    it('should return friendly message on 404', () => {
      service.getAll().subscribe({
        error: err => expect(err.message).toBe('Payment not found.')
      });
      http.expectOne(BASE).flush({}, { status: 404, statusText: 'Not Found' });
    });

    it('should return friendly message on network error', () => {
      service.getAll().subscribe({
        error: err => expect(err.message).toContain('Cannot reach the server')
      });
      http.expectOne(BASE).error(new ProgressEvent('error'));
    });
  });
});
