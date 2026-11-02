import { Chart, type ChartProps } from './Chart'

type BarChartProps = Omit<ChartProps, 'type'>

export function BarChart(props: BarChartProps) {
  return <Chart type="bar" {...props} />
}
