import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RenderLogService } from '../../services/render-log.service';

@Component({
  selector: 'app-log-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="log-panel">
      <div class="log-header">
        <div class="log-header-title">
          Console de rendu
          <span class="log-count">{{ log.count() }}</span>
        </div>
        <button class="log-clear" (click)="log.clear()">Effacer</button>
      </div>

      <div class="log-entries">
        @if (log.entries().length === 0) {
          <div class="log-empty">
            Aucune interaction<br>
            <span style="font-size:0.6rem">Interagissez avec les composants →</span>
          </div>
        }
        @for (entry of log.entries(); track $index) {
          <div class="log-entry log-type-{{ entry.type }}">
            <span class="log-time">{{ entry.timestamp }}</span>
            <span class="log-component-dot"></span>
            <span class="log-component">{{ entry.component }}</span>
            <span class="log-action"> → {{ entry.action }}</span>
            @if (entry.detail) {
              <span class="log-detail"> [{{ entry.detail }}]</span>
            }
          </div>
        }
      </div>

      <div class="stats-bar">
        <div class="stat-item">
          Renders totaux
          <span class="stat-value">{{ log.total() }}</span>
        </div>
        <div class="stat-item">
          Composants actifs
          <span class="stat-value">4</span>
        </div>
        <div class="stat-item">
          Entrées log
          <span class="stat-value">{{ log.count() }}</span>
        </div>
        <div class="stat-item">
          Mode CD
          <span class="stat-value" style="font-size:0.65rem;font-family:'JetBrains Mono'">OnPush</span>
        </div>
      </div>
    </div>
  `,
})
export class LogPanel {
  log = inject(RenderLogService);
}
