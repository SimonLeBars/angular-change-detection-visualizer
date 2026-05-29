import { Injectable, computed, signal } from '@angular/core';

export type LogType = 'render' | 'init' | 'input';

export interface LogEntry {
  timestamp: string;
  component: string;
  action: string;
  type: LogType;
  detail?: string;
}

@Injectable({ providedIn: 'root' })
export class RenderLogService {
  private readonly MAX = 80;
  private _entries = signal<LogEntry[]>([]);
  private _total = signal(0);

  readonly entries = this._entries.asReadonly();
  readonly total = this._total.asReadonly();
  readonly count = computed(() => this._entries().length);

  addEntry(data: Omit<LogEntry, 'timestamp'>): void {
    const now = new Date();
    const ts =
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0') + '.' +
      String(now.getMilliseconds()).padStart(3, '0');

    this._entries.update(prev => {
      const next = [{ ...data, timestamp: ts }, ...prev];
      return next.length > this.MAX ? next.slice(0, this.MAX) : next;
    });
    this._total.update(n => n + 1);
  }

  clear(): void {
    this._entries.set([]);
  }
}
