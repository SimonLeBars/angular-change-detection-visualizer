# Angular Change Detection Visualizer — Plan & Architecture

## Objectif

Outil éducatif qui visualise en temps réel les cycles de Change Detection Angular.
Chaque flash sur un nœud DOM = un vrai `ngAfterViewChecked` Angular déclenché par le framework.

Trois apps côte à côte montrent l'impact de chaque stratégie CD sans changer le code métier.

---

## Structure du projet

```
angular-change-detection-visualizer/
├── PLAN.md
└── ng-workspace/                        ← monorepo Angular CLI
    ├── angular.json
    ├── package.json
    └── projects/
        ├── app-zonejs/                  ← Zone.js + Default CD   (port 4200, rouge)
        ├── app-zoneless/                ← Zoneless + Default CD  (port 4201, orange)
        └── app-onpush/                  ← Zoneless + OnPush      (port 4202, cyan)
```

Chaque projet a la même structure interne :

```
src/app/
├── app.ts / app.html / app.scss / app.config.ts
├── components/
│   ├── counter/counter.ts
│   ├── list/list.ts
│   ├── form/form.ts
│   ├── toggle/toggle.ts
│   └── log-panel/log-panel.ts
├── directives/
│   └── render-flash.directive.ts       ← mécanisme central
└── services/
    ├── render-log.service.ts
    └── animation-config.service.ts
```

---

## Différences entre les trois apps

| App | `app.config.ts` | Composants | Comportement au clic `+` |
|---|---|---|---|
| `app-zonejs` | `provideZoneChangeDetection()` | Default (pas de stratégie) | Tous les composants flashent |
| `app-zoneless` | `provideZonelessChangeDetection()` | Default (pas de stratégie) | Seuls les composants avec signal lu flashent |
| `app-onpush` | `provideZonelessChangeDetection()` | `ChangeDetectionStrategy.OnPush` | Seul le composant dont le signal a changé flashe |

---

## Mécanisme central : `RenderFlashDirective`

```typescript
ngAfterViewChecked(): void {
  const isInit = this.isFirstCheck;
  this.isFirstCheck = false;
  if (isInit && !this.flashOnInit) return;

  this.flash(this.el.nativeElement);
  if (this.config.highlightParent()) {
    const parent = this.el.nativeElement.closest('.component-card-body');
    if (parent) this.flash(parent);
  }
  // Pas d'écriture signal ici : causerait NG0103 (boucle infinie) avec Zone.js
}

private flash(el: HTMLElement): void {
  clearTimeout(this.timeout);
  el.classList.remove('re-rendered');
  void el.offsetWidth;             // force reflow → relance l'animation CSS
  el.classList.add('re-rendered');
  this.ngZone.runOutsideAngular(() => {
    this.timeout = setTimeout(() => el.classList.remove('re-rendered'), dur + 50);
  });
}
```

**Pourquoi pas `@HostBinding` ?** → déclenche un nouveau cycle CD → boucle infinie.  
**Pourquoi `ngZone.runOutsideAngular` pour le timeout ?** → évite de déclencher un cycle CD inutile à la fin du flash.  
**Pourquoi le logging n'est pas dans la directive ?** → une écriture signal dans `ngAfterViewChecked` cause NG0103 avec Zone.js. Chaque composant logue depuis ses méthodes d'action.

---

## Composants et ce qu'ils démontrent

| Composant | Concept démontré |
|---|---|
| `CounterComponent` | Signal local : seul ce composant devrait flasher (vrai pour app-onpush) |
| `ListComponent` | `track item.id` vs `track $index` : shuffle pour observer les re-renders |
| `FormComponent` | ReactiveFormsModule + `valueChanges` → signal → CD |
| `ToggleComponent` | `@if` : insertion/destruction DOM, `flashOnInit=true` |

---

## Services

### `RenderLogService`
- `signal<LogEntry[]>([])` — max 80 entrées LIFO
- `addEntry({ component, action, type, detail? })` — appelé par les méthodes d'action des composants
- `clear()` — bouton "Effacer"
- Types : `'render'` (rouge) · `'init'` (vert) · `'input'` (orange)

### `AnimationConfigService`
- `durationMs = signal(1000)` — durée du flash
- `highlightParent = signal(false)` — flash aussi le `.component-card-body` parent
- `effect()` — sync `--render-duration` CSS variable

---

## Lancer les apps

```bash
cd ng-workspace

# Ouvrir 3 terminaux :
npx ng serve app-zonejs    --port=4200
npx ng serve app-zoneless  --port=4201
npx ng serve app-onpush    --port=4202
```

**Démonstration clé** — cliquer sur `+` dans le Counter de chaque app :
- **4200** (rouge, Zone.js) : Counter + List + Form + Toggle flashent tous
- **4201** (orange, Zoneless) : seuls les composants lisant un signal flashent
- **4202** (cyan, OnPush) : seul le Counter flashe

---

## Pistes d'amélioration

- [ ] Compteur de cycles CD visible en temps réel (distinct des mutations DOM)
- [ ] Mode démo automatique : actions scriptées pour présentation live
- [ ] MutationObserver : injecteur pour visualiser n'importe quelle app Angular tierce
