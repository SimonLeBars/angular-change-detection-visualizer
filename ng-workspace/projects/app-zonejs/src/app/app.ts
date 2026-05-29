import { Component, inject } from '@angular/core';
import { AnimationConfigService } from './services/animation-config.service';
import { RenderLogService } from './services/render-log.service';
import { Counter } from './components/counter/counter';
import { List } from './components/list/list';
import { Form } from './components/form/form';
import { Toggle } from './components/toggle/toggle';
import { LogPanel } from './components/log-panel/log-panel';

@Component({
  selector: 'app-root',
  imports: [Counter, List, Form, Toggle, LogPanel],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  config = inject(AnimationConfigService);
  log = inject(RenderLogService);

  setDuration(event: Event): void {
    const ms = Number((event.target as HTMLSelectElement).value);
    this.config.durationMs.set(ms);
  }

  setHighlight(event: Event): void {
    this.config.highlightParent.set((event.target as HTMLInputElement).checked);
  }
}
