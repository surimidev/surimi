# Compiler Manual - Build Caching Example

Dieses Beispiel demonstriert das Build-Caching-Feature des Surimi-Compilers für inkrementelle Builds und optimierte Entwicklungsgeschwindigkeit.

## Übersicht

Das Projekt enthält mehrere CSS.ts-Dateien in einer strukturierten Architektur:

```
src/
├── index.css.ts                      # Haupt-Entry-Point
└── styles/
    ├── components/
    │   ├── button.css.ts             # Button-Komponenten
    │   ├── card.css.ts               # Card-Komponenten
    │   └── input.css.ts              # Input-Komponenten
    ├── layout/
    │   ├── container.css.ts          # Container-Layouts
    │   └── grid.css.ts               # Grid- und Flex-Layouts
    ├── theme/
    │   ├── colors.css.ts             # Farbpalette
    │   └── typography.css.ts         # Typografie-Styles
    └── utils/
        └── mixins.css.ts             # Wiederverwendbare Mixins
```

## Wie Build-Caching funktioniert

### 1. Cache-Mechanismus

Die Surimi CLI nutzt automatisch im Watch-Modus (`--watch`) ein **LRU (Least Recently Used) Cache-System**:

- **Hash-basierte Validierung**: SHA-256 Hashing für Dateiinhalte
- **Dependency Tracking**: Trackt alle Abhängigkeiten im Import-Baum
- **Automatische Invalidierung**: Bei Änderungen an Dateien oder deren Dependencies
- **Transparent**: Caching läuft im Hintergrund ohne zusätzliche Konfiguration

### 2. Cache-Invalidierung

Der Cache wird automatisch invalidiert wenn:

- ✅ Eine Datei im Projekt geändert wird
- ✅ Eine Abhängigkeit (importierte Datei) geändert wird
- ✅ Der Content-Hash nicht mehr übereinstimmt

### 3. Vorteile

- ⚡ **Schnellere Builds**: Unveränderte Dateien werden aus dem Cache geladen
- 🔄 **Inkrementelle Kompilierung**: Nur geänderte Dateien werden neu kompiliert
- 🎯 **Zero Config**: Automatisch aktiviert im Watch-Modus
- 💾 **Speicher-effizient**: LRU-Eviction bei Erreichen der maximalen Cache-Größe (100 Einträge)

## Installation

```bash
# Dependencies installieren
pnpm install
```

## Verwendung

### Entwicklungsmodus mit Caching

```bash
# Watch-Modus mit automatischem Caching starten
pnpm dev

# Oder explizit
pnpm build:watch
```

Der Watch-Modus startet automatisch und überwacht Änderungen. Drücke `q` zum Beenden.

### Einmaliger Build (ohne Caching)

```bash
pnpm build
```

**Hinweis**: Caching ist nur im Watch-Modus (`--watch`) aktiv, nicht bei einmaligen Builds.

## Build-Caching in Aktion

Wenn du `pnpm dev` ausführst:

1. **Initiale Kompilierung**: Erste Kompilierung aller Dateien
2. **Watch-Modus aktiviert**: Überwacht alle Änderungen
3. **Inkrementelle Updates**:
   - Ändere eine **Leaf-Datei** (z.B. `colors.css.ts`) → Schnelle Rekompilierung dank Cache
   - Ändere eine **häufig importierte Datei** (z.B. `mixins.css.ts`) → Alle abhängigen Dateien werden invalidiert und neu kompiliert

### Beispiel-Output

```
🍣 @surimi/compiler (v0.x.x)

┃  Warning: Early Development
┃
┃  Surimi is still in early development. Please report any issues you encounter!

◇ Running in watch mode. Press 'q' to quit.
◆ Watching index.css.ts...
  ✅ Compiled in 145ms. Watching...
```

Nach einer Änderung siehst du deutlich schnellere Build-Zeiten:

```
  ✅ Compiled in 23ms. Watching...
```

Die reduzierten Build-Zeiten sind das Ergebnis des Cachings - unveränderte Dateien werden nicht neu kompiliert!

## Cache-Konfiguration

Das Caching wird automatisch aktiviert mit folgenden Standard-Einstellungen:

- **Cache aktiviert**: Ja (automatisch im Watch-Modus)
- **Maximale Größe**: 100 Einträge
- **Eviction-Strategie**: LRU (Least Recently Used)
- **Hash-Algorithmus**: SHA-256

Diese Einstellungen funktionieren für die meisten Projekte optimal und erfordern keine manuelle Konfiguration.

## Experimente zum Ausprobieren

### 1. Schnelle Builds durch Caching

1. Starte `pnpm dev`
2. Ändere eine **Leaf-Datei** (z.B. [colors.css.ts](src/styles/theme/colors.css.ts))
3. Beobachte: Die Build-Zeit ist deutlich kürzer (z.B. 20-30ms statt 150ms)
4. Grund: Nur die geänderte Datei und ihre direkten Konsumenten werden neu kompiliert

### 2. Dependency-Invalidierung

1. Starte `pnpm dev`
2. Ändere [mixins.css.ts](src/styles/utils/mixins.css.ts) (wird von vielen Komponenten importiert)
3. Beobachte: Die Build-Zeit ist länger
4. Grund: Alle abhängigen Dateien ([button.css.ts](src/styles/components/button.css.ts), [input.css.ts](src/styles/components/input.css.ts)) werden invalidiert und neu kompiliert

### 3. Cache-Performance messen

1. Starte `pnpm dev` und notiere die initiale Build-Zeit
2. Ändere wiederholt verschiedene **einzelne** Komponenten-Dateien
3. Beobachte: Jede Änderung kompiliert in 10-30ms (vorher: 100-200ms)
4. Fazit: Das Caching beschleunigt inkrementelle Builds um das 5-10fache!

## Technische Details

### Cache-Implementierung

Der Cache wird in `packages/compiler/src/cache.ts` implementiert:

- **LRU-Eviction**: Älteste ungenutzte Einträge werden bei Überschreitung entfernt
- **SHA-256 Hashing**: Für präzise Content-Validierung
- **Dependency Map**: Trackt den kompletten Abhängigkeitsbaum

### Watch-Modus Integration

In `packages/compiler/src/index.ts`:

- `BUNDLE_START`: Invalidiert Cache für geänderte Dateien
- `BUNDLE_END`: Prüft Cache und kompiliert nur bei Bedarf

## Weitere Ressourcen

- [Surimi Compiler Dokumentation](../../packages/compiler/README.md)
- [Cache-Tests](../../packages/compiler/test/unit/cache.spec.ts)
- [Compiler-Implementierung](../../packages/compiler/src/compiler.ts)
