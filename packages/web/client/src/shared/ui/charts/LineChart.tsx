import { Chart, type ChartProps } from './Chart'

type LineChartProps = Omit<ChartProps, 'type'>

export function LineChart(props: LineChartProps) {
  return <Chart type="line" {...props} />
}
