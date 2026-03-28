import { Component, Input } from '@angular/core';
import { Currency } from '../../models/payment.model';

@Component({
  selector: 'app-currency-badge',
  standalone: true,
  template: `<span class="badge" [attr.data-currency]="currency">{{ currency }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      font-family: var(--font-display);
      letter-spacing: 0.05em;
    }
    [data-currency="USD"] { background: rgba(52,199,89,0.15);  color: #34c759; }
    [data-currency="EUR"] { background: rgba(0,122,255,0.15);  color: #4da6ff; }
    [data-currency="INR"] { background: rgba(255,149,0,0.15);  color: #ff9500; }
    [data-currency="GBP"] { background: rgba(175,82,222,0.15); color: #bf7ff5; }
  `]
})
export class CurrencyBadgeComponent {
  @Input() currency!: Currency;
}
