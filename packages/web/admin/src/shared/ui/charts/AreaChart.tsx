import { Chart, type ChartProps } from './Chart'

type AreaChartProps = Omit<ChartProps, 'type'>

export function AreaChart(props: AreaChartProps) {
  return <Chart type="area" {...props} />
}
