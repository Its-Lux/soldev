import { Chart, type ChartProps } from './Chart'
import type { ApexOptions } from 'apexcharts'

interface DonutChartProps extends Omit<ChartProps, 'type' | 'series' | 'categories'> {
  series: number[]
  labels: string[]
  colors?: string[]
  legendPosition?: 'top' | 'right' | 'bottom' | 'left'
}

export function DonutChart({
  series,
  labels,
  colors,
  legendPosition = 'bottom',
  options,
  ...rest
}: DonutChartProps) {
  const percentageOptions: ApexOptions = {
    labels,
    ...(colors?.length ? { colors } : {}),
    legend: { position: legendPosition },
    dataLabels: {
      enabled: true,
      formatter: (_val, opts) => `${(series[opts?.seriesIndex ?? 0] ?? 0).toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (_val, opts) => `${(series[opts?.seriesIndex ?? 0] ?? 0).toFixed(1)}%`,
      },
    },
    ...options,
  }

  return <Chart type="pie" series={series} options={percentageOptions} {...rest} />
}
