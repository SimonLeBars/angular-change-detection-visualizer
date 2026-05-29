import { AfterViewChecked, Directive, ElementRef, Input, NgZone, OnDestroy, inject } from '@angular/core';
import { AnimationConfigService } from '../services/animation-config.service';

@Directive({
  selector: '[appRenderFlash]',
})
export class RenderFlashDirective implements AfterViewChecked, OnDestroy {
  @Input('appRenderFlash') label = 'Unknown';
  @Input() flashOnInit = false;

  private el = inject(ElementRef<HTMLElement>);
  private config = inject(AnimationConfigService);
  private ngZone = inject(NgZone);

  private isFirstCheck = true;
  private timeout?: ReturnType<typeof setTimeout>;

  ngAfterViewChecked(): void {
    const isInit = this.isFirstCheck;
    this.isFirstCheck = false;

    if (isInit && !this.flashOnInit) return;

    this.flash(this.el.nativeElement);

    if (this.config.highlightParent()) {
      const parent = this.el.nativeElement.closest('.component-card-body') as HTMLElement | null;
      if (parent && parent !== this.el.nativeElement) {
        this.flash(parent);
      }
    }
    // Signal writes inside ngAfterViewChecked cause NG0103 with Zone.js (infinite CD loop).
    // Logging is handled by each component's action methods instead.
  }

  private flash(el: HTMLElement): void {
    clearTimeout(this.timeout);
    el.classList.remove('re-rendered');
    void el.offsetWidth;
    el.classList.add('re-rendered');
    const dur = this.config.durationMs();
    this.ngZone.runOutsideAngular(() => {
      this.timeout = setTimeout(() => el.classList.remove('re-rendered'), dur + 50);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeout);
  }
}
