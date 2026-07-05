import { Component, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AnimationConfigService } from './services/animation-config.service';
import { RenderLogService } from './services/render-log.service';
import { Counter } from './components/counter/counter';
import { List } from './components/list/list';
import { Form } from './components/form/form';
import { Toggle } from './components/toggle/toggle';
import { Timer } from './components/timer/timer';
import { LogPanel } from './components/log-panel/log-panel';

@Component({
  selector: 'app-root',
  imports: [Counter, List, Form, Toggle, Timer, LogPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  config = inject(AnimationConfigService);
  log = inject(RenderLogService);
  private doc = inject(DOCUMENT);

  theme = signal<'dark' | 'light'>(
    (localStorage.getItem('domflash-theme') as 'dark' | 'light') ?? 'dark'
  );

  constructor() {
    this.applyTheme(this.theme());
  }

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.applyTheme(next);
    localStorage.setItem('domflash-theme', next);
  }

  private applyTheme(t: 'dark' | 'light'): void {
    if (t === 'light') {
      this.doc.documentElement.dataset['theme'] = 'light';
    } else {
      delete this.doc.documentElement.dataset['theme'];
    }
  }

  setDuration(event: Event): void {
    const ms = Number((event.target as HTMLSelectElement).value);
    this.config.durationMs.set(ms);
  }

  setHighlight(event: Event): void {
    this.config.highlightParent.set((event.target as HTMLInputElement).checked);
  }
}
