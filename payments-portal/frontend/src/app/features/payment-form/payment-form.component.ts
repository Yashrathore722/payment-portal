import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { ToastService } from '../../shared/toast/toast.service';
import { ToastContainerComponent } from '../../shared/toast/toast-container.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { CurrencyBadgeComponent } from '../../shared/currency-badge/currency-badge.component';
import { Payment, CURRENCIES } from '../../models/payment.model';

function positiveAmount(control: AbstractControl): ValidationErrors | null {
  const val = parseFloat(control.value);
  return !isNaN(val) && val > 0 ? null : { positiveAmount: true };
}

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    ToastContainerComponent, ConfirmDialogComponent, CurrencyBadgeComponent
  ],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
  private readonly fb             = inject(FormBuilder);
  private readonly paymentService = inject(PaymentService);
  private readonly toastService   = inject(ToastService);
  private readonly router         = inject(Router);
  private readonly route          = inject(ActivatedRoute);

  readonly currencies = CURRENCIES;
  readonly isEdit     = signal(false);
  readonly saving     = signal(false);
  readonly showDelete = signal(false);
  private editId: number | null = null;
  existingPayment: Payment | null = null;

  readonly currencyNames: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    INR: 'Indian Rupee',
    GBP: 'British Pound'
  };

  form = this.fb.group({
    amount:   ['', [Validators.required, positiveAmount]],
    currency: ['USD', [Validators.required]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.editId = parseInt(id, 10);
      const p: Payment | undefined = history.state?.payment;
      if (p) {
        this.existingPayment = p;
        this.form.patchValue({ amount: String(p.amount), currency: p.currency });
      }
    }
  }

  get amountCtrl()   { return this.form.controls['amount']; }
  get currencyCtrl() { return this.form.controls['currency']; }

  get amountError(): string | null {
    const c = this.amountCtrl;
    if (!c.touched) return null;
    if (c.hasError('required'))       return 'Amount is required.';
    if (c.hasError('positiveAmount')) return 'Amount must be greater than 0.';
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const amount   = parseFloat(this.form.value.amount!);
    const currency = this.form.value.currency as any;

    if (this.isEdit() && this.editId !== null) {
      this.paymentService.update(this.editId, { amount, currency }).subscribe({
        next: () => {
          this.toastService.success('Payment updated successfully.');
          this.router.navigate(['/']);
        },
        error: err => { this.toastService.error(err.message); this.saving.set(false); }
      });
    } else {
      const clientRequestId = crypto.randomUUID();
      this.paymentService.create({ clientRequestId, amount, currency }).subscribe({
        next: payment => {
          this.toastService.success(`Payment ${payment.reference} created.`);
          this.router.navigate(['/']);
        },
        error: err => { this.toastService.error(err.message); this.saving.set(false); }
      });
    }
  }

  confirmDelete(): void { this.showDelete.set(true); }
  cancelDelete():  void { this.showDelete.set(false); }

  executeDelete(): void {
    if (this.editId === null) return;
    this.saving.set(true);
    this.paymentService.delete(this.editId).subscribe({
      next: () => {
        this.toastService.success(`Payment ${this.existingPayment?.reference ?? ''} deleted.`);
        this.router.navigate(['/']);
      },
      error: err => { this.toastService.error(err.message); this.saving.set(false); this.showDelete.set(false); }
    });
  }
}
