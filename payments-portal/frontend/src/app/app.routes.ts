import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/payments-list/payments-list.component').then(m => m.PaymentsListComponent)
  },
  {
    path: 'payments/new',
    loadComponent: () =>
      import('./features/payment-form/payment-form.component').then(m => m.PaymentFormComponent)
  },
  {
    path: 'payments/edit/:id',
    loadComponent: () =>
      import('./features/payment-form/payment-form.component').then(m => m.PaymentFormComponent)
  },
  { path: '**', redirectTo: '' }
];
