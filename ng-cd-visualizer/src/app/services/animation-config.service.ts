import { Injectable, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AnimationConfigService {
  private doc = inject(DOCUMENT);

  readonly durationMs = signal(1000);
  readonly highlightParent = signal(false);

  constructor() {
    effect(() => {
      this.doc.documentElement.style.setProperty(
        '--render-duration',
        `${this.durationMs() / 1000}s`
      );
    });
  }
}
