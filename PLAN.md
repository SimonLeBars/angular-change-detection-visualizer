# DOM Flash Visualizer — Plan & Architecture

## Objectif

Outil éducatif qui visualise visuellement les cycles de Change Detection Angular en temps réel.
Chaque flash rouge sur un nœud DOM = un vrai `ngAfterViewChecked` Angular, pas une simulation.

---

## Structure du projet

```
d:\Projets\DOM_life_cycle\
├── dom-visualizer.html          ← version standalone originale (simulation JS)
├── dom-visualizer.css
├── dom-visualizer.js
└── ng-cd-visualizer/            ← vraie app Angular 21
    └── src/
        ├── index.html           ← Google Fonts (JetBrains Mono, Syne)
        ├── styles.scss          ← thème dark cyberpunk global + .dom-node, .re-rendered
        └── app/
            ├── app.ts           ← AppComponent shell (layout, controls globaux)
            ├── app.html         ← template : header, explainer, 4 sections, log panel
            ├── app.config.ts    ← provideZonelessChangeDetection()
            ├── directives/
            │   └── render-flash.directive.ts   ← LE mécanisme central
            ├── services/
            │   ├── render-log.service.ts        ← signal<LogEntry[]>, log panel
            │   └── animation-config.service.ts ← durationMs signal + CSS var sync
            └── components/
                ├── counter/counter.ts      ← count signal, increment/decrement/reset
                ├── list/list.ts            ← items signal, trackBy demo (toggle)
                ├── form/form.ts            ← ReactiveFormsModule + valueChanges → signal
                ├── toggle/toggle.ts        ← @if panels, flashOnInit=true
                └── log-panel/log-panel.ts  ← console temps-réel, stats
```

---

## Mécanisme central : `RenderFlashDirective`

```typescript
// Déclenché par Angular lui-même à chaque cycle CD sur le composant hôte
ngAfterViewChecked(): void {
  if (isFirstCheck && !flashOnInit) return; // évite le bruit au chargement

  el.classList.remove('re-rendered');
  void el.offsetWidth;          // force reflow → restart animation CSS
  el.classList.add('re-rendered');

  logService.addEntry({ ... }); // signal write → LogPanel se met à jour
}
```

**Pourquoi pas `@HostBinding` ?** → déclenche un nouveau cycle CD → boucle infinie.
**Pourquoi pas `NgZone.runOutsideAngular` ?** → Angular 21 est Zoneless, pas de zone.

---

## Composants et ce qu'ils démontrent

| Composant | Concept Angular démontré |
|---|---|
| `CounterComponent` | CD Default : signal change → seul ce composant flashe |
| `ListComponent` | `track item.id` vs `track $index` : bouton toggle, shuffle pour voir |
| `FormComponent` | ReactiveFormsModule + `valueChanges` → signal → CD |
| `ToggleComponent` | `@if` : insertion/destruction DOM réelle, `flashOnInit=true` |

---

## Services

### `RenderLogService`
- `signal<LogEntry[]>([])` → max 80 entrées, LIFO
- `addEntry({ component, action, type, detail? })` — appelé par la directive
- `clear()` — bouton "Effacer" dans le log panel
- Types de log : `'render'` (rouge) · `'init'` (vert) · `'input'` (orange)

### `AnimationConfigService`
- `durationMs = signal(1000)` → contrôle la durée du flash
- `highlightParent = signal(false)` → flash aussi le `.component-card-body` parent
- `effect()` → sync `--render-duration` CSS variable automatiquement

---

## Comportement clé : Zoneless Angular 21

Sans zone.js, le CD est déclenché uniquement par :
- Changement de signal lu dans le template → seul le composant affecté flashe
- Event bindings Angular `(click)`, `(change)` → wrappé par Angular

**Conséquence pédagogique :** cliquer sur counter ne flashe PAS le form ni la liste —
contrairement à Zone.js Default où TOUT l'arbre était vérifié. C'est le comportement
"OnPush-like" apporté par les signaux, sans avoir à configurer OnPush manuellement.

---

## Lancer les apps

### App standalone (archive)
```bash
cd d:\Projets\DOM_life_cycle\ng-cd-visualizer
npx ng serve --open   # → http://localhost:4200
```

### Monorepo (3 versions comparatives)
```bash
cd d:\Projets\DOM_life_cycle\ng-workspace

# Ouvrir 3 terminaux :
npx ng serve app-zonejs    --port=4200   # Zone.js + Default CD   → rouge
npx ng serve app-zoneless  --port=4201   # Zoneless + Default CD  → orange
npx ng serve app-onpush    --port=4202   # Zoneless + OnPush       → cyan
```

**Démonstration clé :** cliquer sur `+` dans le Counter de chaque app :
- `4200` (rouge) : Counter + List + Form + Toggle flashent tous
- `4201` (orange) : idem, mais seulement quand un signal change (pas au scroll)
- `4202` (cyan) : seul le Counter flashe

---

## Prochaines directions possibles

- [ ] Mode **OnPush** : variantes de composants avec `ChangeDetectionStrategy.OnPush`,
      montrer qu'ils ne flashent pas même si signal externe change
- [ ] **MutationObserver** : injecter le visualiseur dans n'importe quelle page Angular
- [ ] Export **bookmarklet** : script injecteur pour app Angular tierce
- [ ] **CD counter** : distinguer "CD checks" vs "mutations DOM réelles"
