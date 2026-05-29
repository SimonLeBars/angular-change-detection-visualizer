import { Component, inject, signal } from '@angular/core';
import { RenderFlashDirective } from '../../directives/render-flash.directive';
import { RenderLogService } from '../../services/render-log.service';

@Component({
  selector: 'app-toggle',
  imports: [RenderFlashDirective],
  template: `
    <div class="component-card-body dom-node"
         appRenderFlash="ToggleComponent · wrapper">
      <div class="toggle-demo">

        <div class="toggle-row">
          <span>Afficher panneau A</span>
          <label class="toggle-switch">
            <input type="checkbox" [checked]="showA()" (change)="toggle('a')">
            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>
        </div>
        @if (showA()) {
          <div class="toggle-panel dom-node"
               style="color:var(--orange)"
               appRenderFlash="PanelA"
               [flashOnInit]="true">
            ✦ Panneau A inséré dans le DOM — <em>&#64;if="showA()"</em>
          </div>
        }

        <div class="toggle-row" style="margin-top:4px;">
          <span>Afficher panneau B</span>
          <label class="toggle-switch">
            <input type="checkbox" [checked]="showB()" (change)="toggle('b')">
            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>
        </div>
        @if (showB()) {
          <div class="toggle-panel dom-node"
               style="color:var(--orange)"
               appRenderFlash="PanelB"
               [flashOnInit]="true">
            ✦ Panneau B inséré dans le DOM — <em>&#64;if="showB()"</em>
          </div>
        }

      </div>
    </div>
  `,
})
export class Toggle {
  showA = signal(false);
  showB = signal(false);
  private log = inject(RenderLogService);

  toggle(panel: 'a' | 'b'): void {
    if (panel === 'a') {
      this.showA.update(v => !v);
      this.log.addEntry({
        component: 'ToggleComponent',
        action: `showA = ${this.showA()}`,
        type: this.showA() ? 'init' : 'render',
        detail: this.showA() ? 'DOM insert' : 'DOM remove',
      });
    } else {
      this.showB.update(v => !v);
      this.log.addEntry({
        component: 'ToggleComponent',
        action: `showB = ${this.showB()}`,
        type: this.showB() ? 'init' : 'render',
        detail: this.showB() ? 'DOM insert' : 'DOM remove',
      });
    }
  }
}
