# 0009. Theme and charts

Status: Proposed
Date: 2026-10-05

## Context

This is a reusable template, not a branded product, so re-skinning it should
mean editing one place. Dark mode has to work through Tailwind's `dark:`
utilities. Charts need the current theme's colours. The boundaries rule means
code in `shared/` cannot import from `app/`.

## Decision

1. **Semantic colour tokens.** `index.css` defines `--color-background`,
   `--color-foreground`, `--color-border`, `--color-surface`, `--color-muted`
   and `--color-accent`, and components use these instead of raw colours. The
   one deliberate exception is `Badge`, whose status colours are raw palette
   values, because a warning should look yellow whatever the brand colour is.
2. **Class-based dark mode.** Tailwind v4 defaults to the media query only, so
   `@custom-variant dark (&:where(.dark, .dark *));` makes `dark:` follow a
   `.dark` class on the root element.
3. **`ThemeProvider` and `useTheme` live in `shared/lib/theme/`**, not in
   `app/providers/`, because a chart in `shared/ui` cannot import a context
   from `app/`. The choice is saved to `localStorage`, and the system
   preference is used only when there is no saved choice. The context and hook
   are in a `.ts` file, separate from the provider component, so Vite's Fast
   Refresh keeps working.
4. **A chart base in `shared/ui/charts/`.** `Chart` wraps ApexCharts, and typed
   `LineChart`, `BarChart`, `AreaChart`, `PieChart` and `DonutChart` wrappers
   derive their props with `Omit<ChartProps, 'type'>` instead of repeating
   them. `Chart` reads the theme and has a `loading` state backed by a generic
   `SkeletonLoader`.
5. **Motion only where it answers a user action**, such as the active nav
   indicator and the sidebar collapse, never as decoration.

## Alternatives Considered

**Raw colours in each component.** Rejected. Re-skinning would mean hunting
through every component.

**Leave Tailwind's dark mode on the media query.** Rejected. The `dark:`
utilities would ignore the theme toggle.

**Put the theme provider in `app/providers/`.** Rejected. It breaks the
boundaries rule for any shared component that reads the theme.

## Consequences

**Easier:** one CSS block re-skins the template, and every shared component
follows the theme, including charts.

**Harder:** toggling the theme remounts pie and donut charts, with a brief
flash, because updating them in place crashed inside `react-apexcharts`.
Remounting through a `key` avoids the library's update path but loses the
smooth colour transition. Components must keep to the tokens, which takes
discipline, and `Badge` is the only exception.
