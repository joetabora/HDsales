# Forge Design System

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| `forge-background` | `#09090b` | Page background |
| `forge-surface` | `#18181b` | Cards, inputs |
| `forge-border` | `#27272a` | Borders |
| `forge-accent` | `#f97316` | Primary actions, brand |
| `forge-muted` | `#71717a` | Secondary text |

## Typography

- Font: Geist Sans (system fallback)
- Tabular numerals for metrics
- 4px spacing grid

## Components

Built on shadcn/ui patterns with Radix primitives. All in `src/components/ui/`.

## Motion

Framer Motion for page transitions, list animations, and micro-interactions. Keep durations 150-300ms.

## Glassmorphism

Use sparingly — command palette and modal overlays only:
`backdrop-blur-xl bg-forge-surface/80`
