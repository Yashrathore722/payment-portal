import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ToastContainerComponent } from '../../shared/toast/toast-container.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CurrencyBadgeComponent } from '../../shared/currency-badge/currency-badge.component';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CommonModule, RouterLink, DatePipe, DecimalPipe,
    ToastContainerComponent, ConfirmDialogComponent, CurrencyBadgeComponent
  ],
  templateUrl: './payments-list.component.html',
  styleUrls: ['./payments-list.component.scss']
})
export class PaymentsListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly toastService  = inject(ToastService);
  private readonly router        = inject(Router);

  payments     = signal<Payment[]>([]);
  loading      = signal(true);
  error        = signal<string | null>(null);
  deleteTarget = signal<Payment | null>(null);
  deleting     = signal(false);

  ngOnInit(): void { this.loadPayments(); }

  loadPayments(): void {
    this.loading.set(true);
    this.error.set(null);
    this.paymentService.getAll().subscribe({
      next: data => { this.payments.set(data); this.loading.set(false); },
      error: err  => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  editPayment(payment: Payment): void {
    this.router.navigate(['/payments/edit', payment.id], {
      state: { payment }
    });
  }

  confirmDelete(payment: Payment): void { this.deleteTarget.set(payment); }
  cancelDelete(): void  { this.deleteTarget.set(null); }

  executeDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.paymentService.delete(target.id).subscribe({
      next: () => {
        this.payments.update(list => list.filter(p => p.id !== target.id));
        this.toastService.success(`Payment ${target.reference} deleted.`);
        this.deleteTarget.set(null);
        this.deleting.set(false);
      },
      error: err => {
        this.toastService.error(err.message);
        this.deleteTarget.set(null);
        this.deleting.set(false);
      }
    });
  }
}
