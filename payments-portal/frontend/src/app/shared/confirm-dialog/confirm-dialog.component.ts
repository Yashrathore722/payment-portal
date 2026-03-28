import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible) {
      <div class="overlay" (click)="onCancel()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <h3 class="dialog-title">{{ title }}</h3>
          <p class="dialog-body">{{ message }}</p>
          <div class="dialog-actions">
            <button class="btn btn-ghost" (click)="onCancel()">Cancel</button>
            <button class="btn btn-danger" (click)="onConfirm()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 500;
      animation: fadeIn 150ms ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .dialog {
      background: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      width: min(420px, 90vw);
      box-shadow: var(--shadow-lg);
      animation: scaleIn 150ms ease;
    }
    @keyframes scaleIn { from { transform: scale(0.95); } to { transform: scale(1); } }
    .dialog-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      margin-bottom: 0.75rem;
    }
    .dialog-body {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1.75rem;
      line-height: 1.6;
    }
    .dialog-actions {
      display: flex; justify-content: flex-end; gap: 0.75rem;
    }
    .btn { padding: 0.6rem 1.25rem; border-radius: var(--radius); font-weight: 600; font-size: 0.875rem; cursor: pointer; border: none; transition: opacity var(--transition); }
    .btn:hover { opacity: 0.8; }
    .btn-ghost { background: var(--surface); color: var(--text-secondary); border: 1px solid var(--border); }
    .btn-danger { background: var(--danger); color: #fff; }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmLabel = 'Delete';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel():  void { this.cancelled.emit(); }
}
