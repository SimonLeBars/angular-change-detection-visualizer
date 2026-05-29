# DOMFlash — Angular Change Detection Visualizer

## Contexte du projet

Outil pédagogique pour visualiser le Change Detection Angular. Cible : **cours / formations** (projection en salle). Trois apps Angular côte à côte dans un monorepo `ng-workspace` :

- **app-zonejs** (port 4200) — Zone.js + Default CD
- **app-zoneless** (port 4201) — Zoneless + Default CD
- **app-onpush** (port 4202) — Zoneless + OnPush

## Commandes de développement

```bash
cd ng-workspace
npx ng serve app-zonejs --port=4200
npx ng serve app-zoneless --port=4201
npx ng serve app-onpush --port=4202

# Build toutes les apps
npx ng build app-zonejs && npx ng build app-zoneless && npx ng build app-onpush
```

## Accessibilité & lisibilité (PRIORITÉ)

Le projet est utilisé **en projection lors de cours**. Les contraintes sont fortes :

- **Contraste minimum** : ne jamais utiliser `--text-muted` (`#3a4558`) pour du texte lisible — contraste insuffisant même en conditions normales, inutilisable en projection. Préférer `--text-dim` (`#5a6a80`) au minimum, `--text` (`#c8d6e8`) pour le contenu important.
- **Taille de police** : 0.8rem minimum pour les hints/légendes, 0.9rem+ pour le contenu principal.
- **`<code>` dans les hints** : toujours styler avec `background: var(--surface)` + `color: var(--text)` pour que les termes techniques ressortent.
- **Thème light à implémenter** : les apps nécessitent un thème clair (light mode) pour une meilleure lisibilité en projection. Prévoir via `data-theme="light"` sur `<html>` et redéfinition des variables CSS dans `[data-theme="light"]`. Voir la section "Améliorations prévues".

## Architecture clé

- `RenderFlashDirective` — détecte `ngAfterViewChecked`, déclenche un flash CSS rouge sur le nœud DOM.
- `RenderLogService` — log centralisé des événements CD, affiché dans `LogPanelComponent`.
- `AnimationConfigService` — durée du flash partagée entre les composants.
- **app-zonejs** : `RenderFlashDirective` utilise `NgZone.runOutsideAngular()` pour le `setTimeout` du flash (évite une boucle infinie CD).
- **app-zoneless / app-onpush** : pas de NgZone, le log est appelé directement depuis `ngAfterViewChecked`.

## Améliorations prévues

- [ ] **Thème light** pour projection : `[data-theme="light"]` redéfinissant toutes les variables CSS. Toggle accessible depuis l'interface.
- [ ] Déploiement GitHub Pages (ng deploy).
- [ ] `computed()` signal — dérivation paresseuse.
- [ ] `takeUntilDestroyed` / `DestroyRef` — demo fuite mémoire.
- [ ] Vue côte-à-côte des 3 apps (iframes ou window.postMessage).
