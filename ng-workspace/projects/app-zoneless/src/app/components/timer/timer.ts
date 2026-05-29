import { ChangeDetectorRef, Component, OnDestroy, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, Subject, Subscription } from 'rxjs';
import { RenderFlashDirective } from '../../directives/render-flash.directive';
import { RenderLogService } from '../../services/render-log.service';

type RxMode = 'none' | 'markForCheck' | 'toSignal';

@Component({
  selector: 'app-timer',
  imports: [RenderFlashDirective],
  template: `
    <div class="component-card-body dom-node" appRenderFlash="TimerComponent · wrapper">

      <div class="timer-section">
        <div class="timer-section-title">A — <code>setInterval</code> · Zoneless = pas de CD automatique</div>
        <div class="timer-row">
          <div class="timer-display dom-node" appRenderFlash="TimerComponent · ghost-ticks">
            <span class="timer-value" style="color:var(--orange)">{{ ghostTicks }}</span>
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
        <div class="timer-hint" [class.is-ok]="isRunning()">
          @if (isRunning()) {
            ✓ Zoneless : le timer tourne (ghostTicks s'incrémente en mémoire), mais aucun CD n'est déclenché.
            Cliquez sur <strong>+</strong> dans Counter — Default CD vérifie tout le composant → ghostTicks apparaît.
          } @else {
            Contrairement à Zone.js, le timer ne déclenchera aucun CD sur les autres composants.
          }
        </div>
      </div>

      <hr class="timer-divider">

      <div class="timer-section">
        <div class="timer-section-title">B — <code>interval()</code> RxJS · Observable sans signal</div>
        <div class="timer-modes">
          <button class="btn" [class.active]="rxMode() === 'none'" (click)="setRxMode('none')">
            sans markForCheck
          </button>
          <button class="btn" [class.active]="rxMode() === 'markForCheck'" (click)="setRxMode('markForCheck')">
            markForCheck()
          </button>
          <button class="btn" [class.active]="rxMode() === 'toSignal'" (click)="setRxMode('toSignal')">
            toSignal()
          </button>
        </div>
        <div class="timer-row">
          <div class="timer-display dom-node" appRenderFlash="TimerComponent · rxjs-ticks">
            @if (rxMode() === 'toSignal') {
              <span class="timer-value" style="color:var(--orange)">{{ rxjsSignal() }}</span>
              <span class="timer-unit">signal ticks</span>
            } @else {
              <span class="timer-value" style="color:var(--orange)">{{ rxjsTicks }}</span>
              <span class="timer-unit">ticks RxJS</span>
            }
          </div>
          <div style="display:flex;gap:6px">
            @if (!rxRunning()) {
              <button class="btn" (click)="startRx()">▶ Démarrer</button>
            } @else {
              <button class="btn btn-danger" (click)="stopRx()">■ Arrêter</button>
            }
          </div>
        </div>
        <div class="timer-hint"
             [class.is-warning]="rxMode() === 'none' && rxRunning()"
             [class.is-ok]="rxMode() !== 'none' && rxRunning()">
          @switch (rxMode()) {
            @case ('none') {
              La subscription s'exécute mais sans signal ni <code>markForCheck()</code>,
              Zoneless ne déclenche aucun CD → la vue reste figée.
            }
            @case ('markForCheck') {
              <code>cdr.markForCheck()</code> notifie Angular qu'une vérification est nécessaire
              → CD déclenché → vue mise à jour à chaque tick.
            }
            @case ('toSignal') {
              <code>toSignal(observable)</code> enrobe l'Observable dans un signal Angular.
              Chaque émission met à jour le signal → CD déclenché automatiquement.
            }
          }
        </div>
      </div>

    </div>
  `,
})
export class Timer implements OnDestroy {
  ghostTicks = 0;
  isRunning = signal(false);

  rxMode = signal<RxMode>('none');
  rxRunning = signal(false);
  rxjsTicks = 0;
  private rxSignalSrc = new Subject<number>();
  rxjsSignal = toSignal(this.rxSignalSrc, { initialValue: 0 });
  private rxCounter = 0;
  private setIntervalRef?: ReturnType<typeof setInterval>;
  private rxSub?: Subscription;

  private cdr = inject(ChangeDetectorRef);
  private log = inject(RenderLogService);

  start(): void {
    this.setIntervalRef = setInterval(() => { this.ghostTicks++; }, 500);
    this.isRunning.set(true);
    this.log.addEntry({ component: 'TimerComponent', action: 'start()', type: 'init' });
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

  setRxMode(mode: RxMode): void {
    if (this.rxRunning()) {
      this.stopRx();
      this.rxjsTicks = 0;
      this.rxSignalSrc.next(0);
    }
    this.rxMode.set(mode);
    this.log.addEntry({ component: 'TimerComponent', action: 'setRxMode()', type: 'input', detail: mode });
  }

  startRx(): void {
    const mode = this.rxMode();
    this.rxCounter = 0;
    this.rxSub = interval(1000).subscribe(() => {
      this.rxCounter++;
      if (mode === 'toSignal') {
        this.rxSignalSrc.next(this.rxCounter);
      } else {
        this.rxjsTicks = this.rxCounter;
        if (mode === 'markForCheck') {
          this.cdr.markForCheck();
        }
      }
    });
    this.rxRunning.set(true);
    this.log.addEntry({ component: 'TimerComponent', action: 'startRx()', type: 'init', detail: mode });
  }

  stopRx(): void {
    this.rxSub?.unsubscribe();
    this.rxRunning.set(false);
    this.log.addEntry({ component: 'TimerComponent', action: 'stopRx()', type: 'render' });
  }

  ngOnDestroy(): void {
    clearInterval(this.setIntervalRef);
    this.rxSub?.unsubscribe();
    this.rxSignalSrc.complete();
  }
}
