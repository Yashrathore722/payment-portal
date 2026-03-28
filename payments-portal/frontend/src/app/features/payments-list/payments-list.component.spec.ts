import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentsListComponent } from './payments-list.component';
import { PaymentService } from '../../services/payment.service';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Payment } from '../../models/payment.model';

const mockPayments: Payment[] = [
  { id: 1, reference: 'PAY-20250910-0001', amount: 100, currency: 'USD', createdAt: '2025-09-10T10:00:00Z', clientRequestId: 'guid-1' },
  { id: 2, reference: 'PAY-20250910-0002', amount: 250, currency: 'EUR', createdAt: '2025-09-10T11:00:00Z', clientRequestId: 'guid-2' }
];

describe('PaymentsListComponent', () => {
  let component: PaymentsListComponent;
  let fixture: ComponentFixture<PaymentsListComponent>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;

  beforeEach(async () => {
    paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['getAll', 'delete']);
    paymentServiceSpy.getAll.and.returnValue(of(mockPayments));

    await TestBed.configureTestingModule({
      imports: [PaymentsListComponent, RouterModule.forRoot([])],
      providers: [{ provide: PaymentService, useValue: paymentServiceSpy }]
    }).compileComponents();

    fixture   = TestBed.createComponent(PaymentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and display payments on init', () => {
    expect(component.payments().length).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('should show error state when service fails', () => {
    paymentServiceSpy.getAll.and.returnValue(throwError(() => new Error('Server error')));
    component.loadPayments();
    expect(component.error()).toBe('Server error');
    expect(component.loading()).toBeFalse();
  });

  it('should set deleteTarget when confirmDelete is called', () => {
    component.confirmDelete(mockPayments[0]);
    expect(component.deleteTarget()).toEqual(mockPayments[0]);
  });

  it('should clear deleteTarget when cancelDelete is called', () => {
    component.confirmDelete(mockPayments[0]);
    component.cancelDelete();
    expect(component.deleteTarget()).toBeNull();
  });

  it('should remove payment from list after successful delete', () => {
    paymentServiceSpy.delete.and.returnValue(of(undefined));
    component.confirmDelete(mockPayments[0]);
    component.executeDelete();
    expect(component.payments().length).toBe(1);
    expect(component.payments()[0].id).toBe(2);
  });
});
