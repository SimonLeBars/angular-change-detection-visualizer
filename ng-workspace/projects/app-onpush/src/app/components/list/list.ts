import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RenderFlashDirective } from '../../directives/render-flash.directive';
import { RenderLogService } from '../../services/render-log.service';
import { ListItemComp } from './list-item';

export interface ListItem {
  id: number;
  label: string;
}

@Component({
  selector: 'app-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RenderFlashDirective, ListItemComp],
  template: `
    <div class="component-card-body dom-node"
         appRenderFlash="ListComponent · wrapper">
      <ul class="item-list">
        @if (useTrackBy()) {
          @for (item of items(); track item.id) {
            <app-list-item [item]="item" [trackById]="true" (deleted)="delete($event)" />
          }
        } @else {
          @for (item of items(); track $index) {
            <app-list-item [item]="item" [trackById]="false" (deleted)="delete($event)" />
          }
        }
      </ul>
      <div class="list-actions">
        <button class="btn" (click)="add()">+ Ajouter item</button>
        <button class="btn btn-danger" (click)="shuffle()">↕ Mélanger</button>
        <button class="btn" [class.active]="useTrackBy()" (click)="toggleTrackBy()">
          trackBy: {{ useTrackBy() ? 'id ✓' : 'index ✗' }}
        </button>
      </div>
      <div class="timer-hint">
        <code>ListItemComp</code> utilise <code>OnPush</code>. <strong>track id</strong> → instance réutilisée, même référence d'input → pas de flash. <strong>track $index</strong> → input change à chaque position → flash.
      </div>
    </div>
  `,
})
export class List {
  private nextId = 4;
  items = signal<ListItem[]>([
    { id: 1, label: 'Premier élément' },
    { id: 2, label: 'Deuxième élément' },
    { id: 3, label: 'Troisième élément' },
  ]);
  useTrackBy = signal(false);
  private log = inject(RenderLogService);

  add(): void {
    const names = ['Nouveau composant', 'Service injecté', 'Module chargé', 'Directive appliquée', 'Pipe transformé', 'Guard activé'];
    const label = names[Math.floor(Math.random() * names.length)] + ` #${this.nextId}`;
    this.items.update(list => [...list, { id: this.nextId++, label }]);
    this.log.addEntry({ component: 'ListComponent', action: 'add()', type: 'input', detail: `length=${this.items().length}` });
  }

  delete(id: number): void {
    this.items.update(list => list.filter(i => i.id !== id));
    this.log.addEntry({ component: 'ListComponent', action: 'delete()', type: 'render', detail: `length=${this.items().length}` });
  }

  shuffle(): void {
    this.items.update(list => {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    });
    const mode = this.useTrackBy()
      ? 'trackBy: id → wrapper seul re-checké, items OnPush protégés'
      : 'trackBy: $index → items reçoivent de nouveaux inputs → re-render';
    this.log.addEntry({ component: 'ListComponent', action: 'shuffle()', type: 'render', detail: mode });
  }

  toggleTrackBy(): void {
    this.useTrackBy.update(v => !v);
    this.log.addEntry({ component: 'ListComponent', action: 'toggleTrackBy()', type: 'input', detail: `trackBy: ${this.useTrackBy() ? 'id' : 'index'}` });
  }
}
