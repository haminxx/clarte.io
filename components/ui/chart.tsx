'use client'

import dynamic from 'next/dynamic'

export type { ChartConfig } from './chart-inner'

/** Lazy-load Recharts to reduce initial bundle. Loads only when chart is used. */
export const ChartContainer = dynamic(
  () =>
    import('./chart-inner').then((m) => ({
      default: m.ChartContainerInner,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video animate-pulse items-center justify-center rounded-lg bg-muted/50" />
    ),
  }
)

export const ChartTooltip = dynamic(
  () => import('./chart-inner').then((m) => ({ default: m.ChartTooltip })),
  { ssr: false }
)

export const ChartTooltipContent = dynamic(
  () =>
    import('./chart-inner').then((m) => ({ default: m.ChartTooltipContent })),
  { ssr: false }
)

export const ChartLegend = dynamic(
  () => import('./chart-inner').then((m) => ({ default: m.ChartLegend })),
  { ssr: false }
)

export const ChartLegendContent = dynamic(
  () =>
    import('./chart-inner').then((m) => ({ default: m.ChartLegendContent })),
  { ssr: false }
)

export const ChartStyle = dynamic(
  () => import('./chart-inner').then((m) => ({ default: m.ChartStyle })),
  { ssr: false }
)
