import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RenderFlashDirective } from '../../directives/render-flash.directive';
import type { ListItem } from './list';

@Component({
  selector: 'app-list-item',
  imports: [RenderFlashDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <li class="dom-node"
        [appRenderFlash]="'ListItem #' + item().id + (trackById() ? ' · track id' : ' · track $index')"
        [flashOnInit]="true">
      <span>
        <span class="item-index">#{{ item().id }}</span>{{ item().label }}
      </span>
      <button class="item-delete" (click)="deleted.emit(item().id)">✕</button>
    </li>
  `,
})
export class ListItemComp {
  item = input.required<ListItem>();
  trackById = input<boolean>(false);
  deleted = output<number>();
}
