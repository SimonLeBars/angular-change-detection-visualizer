import { Component, NgZone, OnDestroy, inject, signal } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { RenderFlashDirective } from '../../directives/render-flash.directive';
import { RenderLogService } from '../../services/render-log.service';

@Component({
  selector: 'app-timer',
  imports: [RenderFlashDirective],
  template: `
    <div class="component-card-body dom-node" appRenderFlash="TimerComponent · wrapper">

      <div class="timer-section">
        <div class="timer-section-title">A — <code>setInterval</code> · trigger Zone.js</div>
        <div class="timer-row">
          <div class="timer-display dom-node" appRenderFlash="TimerComponent · ghost-ticks">
            <span class="timer-value" style="color:var(--red)">{{ ghostTicks }}</span>
            <span class="timer-unit">ghost ticks</span>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            @if (!isRunning()) {
              <button class="btn" (click)="start()">▶ Démarrer</button>
            } @else {
              <button class="btn btn-danger" (click)="stop()">■ Arrêter</button>
            }
            <button class="btn" (click)="resetGhost()" title="Réinitialiser">↺</button>
          </div>
        </div>
        <label class="timer-toggle-label">
          <input type="checkbox" [checked]="runOutside()" (change)="toggleRunOutside($event)"
                 style="accent-color:var(--red)">
          <code>ngZone.runOutsideAngular()</code>
        </label>
        <div class="timer-hint"
             [class.is-warning]="isRunning() && !runOutside()"
             [class.is-ok]="isRunning() && runOutside()">
          @if (isRunning() && !runOutside()) {
            ⚠ Zone.js déclenche un CD global toutes les 500ms — Counter, List, Form, Toggle flashent sans interaction !
          } @else if (isRunning() && runOutside()) {
            ✓ runOutsideAngular() : Zone.js ignore ce timer → aucun flash parasite. ghostTicks reste figé dans la vue.
          } @else {
            Démarrez le timer, puis observez les autres composants flasher spontanément.
          }
        </div>
      </div>

      <hr class="timer-divider">

      <div class="timer-section">
        <div class="timer-section-title">B — <code>interval()</code> RxJS · Observable async</div>
        <div class="timer-row">
          <div class="timer-display dom-node" appRenderFlash="TimerComponent · rxjs-ticks">
            <span class="timer-value" style="color:var(--red)">{{ rxjsTicks }}</span>
            <span class="timer-unit">ticks RxJS</span>
          </div>
          <div style="display:flex;gap:6px">
            @if (!rxRunning()) {
              <button class="btn" (click)="startRx()">▶ Démarrer</button>
            } @else {
              <button class="btn btn-danger" (click)="stopRx()">■ Arrêter</button>
            }
          </div>
        </div>
        <div class="timer-hint">
          Zone.js intercepte chaque émission RxJS → <code>rxjsTicks</code> s'affiche automatiquement,
          sans signal ni <code>markForCheck()</code>. Zone.js masque le besoin de gestion explicite.
        </div>
      </div>

    </div>
  `,
})
export class Timer implements OnDestroy {
  ghostTicks = 0;
  rxjsTicks = 0;
  isRunning = signal(false);
  runOutside = signal(false);
  rxRunning = signal(false);

  private ngZone = inject(NgZone);
  private log = inject(RenderLogService);
  private setIntervalRef?: ReturnType<typeof setInterval>;
  private rxSub?: Subscription;

  start(): void {
    const tick = () => { this.ghostTicks++; };
    if (this.runOutside()) {
      this.ngZone.runOutsideAngular(() => {
        this.setIntervalRef = setInterval(tick, 500);
      });
    } else {
      this.setIntervalRef = setInterval(tick, 500);
    }
    this.isRunning.set(true);
    this.log.addEntry({ component: 'TimerComponent', action: 'start()', type: 'init', detail: this.runOutside() ? 'outside zone' : 'in zone' });
  }

  stop(): void {
    clearInterval(this.setIntervalRef);
    this.isRunning.set(false);
    this.log.addEntry({ component: 'TimerComponent', action: 'stop()', type: 'render' });
  }

  resetGhost(): void {
    this.ghostTicks = 0;
    this.log.addEntry({ component: 'TimerComponent', action: 'reset()', type: 'input', detail: 'ghostTicks → 0' });
  }

  toggleRunOutside(event: Event): void {
    const v = (event.target as HTMLInputElement).checked;
    if (this.isRunning()) { this.stop(); this.ghostTicks = 0; }
    this.runOutside.set(v);
    this.log.addEntry({ component: 'TimerComponent', action: 'runOutsideAngular', type: 'input', detail: v ? 'on' : 'off' });
  }

  startRx(): void {
    this.rxSub = interval(1000).subscribe(() => { this.rxjsTicks++; });
    this.rxRunning.set(true);
    this.log.addEntry({ component: 'TimerComponent', action: 'startRx()', type: 'init' });
  }

  stopRx(): void {
    this.rxSub?.unsubscribe();
    this.rxRunning.set(false);
    this.log.addEntry({ component: 'TimerComponent', action: 'stopRx()', type: 'render' });
  }

  ngOnDestroy(): void {
    clearInterval(this.setIntervalRef);
    this.rxSub?.unsubscribe();
  }
}
