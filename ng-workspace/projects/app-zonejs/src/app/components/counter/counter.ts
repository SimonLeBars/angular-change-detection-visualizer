import { Component, inject, signal } from '@angular/core';
import { RenderFlashDirective } from '../../directives/render-flash.directive';
import { RenderLogService } from '../../services/render-log.service';

@Component({
  selector: 'app-counter',
  imports: [RenderFlashDirective],
  template: `
    <div class="component-card-body dom-node"
         appRenderFlash="CounterComponent · wrapper">
      <div class="counter-display">
        <button class="btn btn-danger" (click)="decrement()">−</button>
        <div class="count-value dom-node"
             appRenderFlash="CounterComponent · count">
          {{ count() }}
        </div>
        <button class="btn" (click)="increment()">+</button>
        <button class="btn" (click)="reset()"
                style="margin-left:8px;font-size:0.65rem;color:var(--text-muted)">
          reset
        </button>
      </div>
      <div class="timer-hint">
        <code>count.update()</code> → signal modifié → Zone.js déclenche un CD global → Default CD vérifie toute l'arborescence → tous les composants flashent.
      </div>
    </div>
  `,
})
export class Counter {
  count = signal(0);
  private log = inject(RenderLogService);

  increment(): void {
    this.count.update(n => n + 1);
    this.log.addEntry({ component: 'CounterComponent', action: 'increment()', type: 'input', detail: String(this.count()) });
  }

  decrement(): void {
    this.count.update(n => n - 1);
    this.log.addEntry({ component: 'CounterComponent', action: 'decrement()', type: 'input', detail: String(this.count()) });
  }

  reset(): void {
    this.count.set(0);
    this.log.addEntry({ component: 'CounterComponent', action: 'reset()', type: 'input', detail: '0' });
  }
}
