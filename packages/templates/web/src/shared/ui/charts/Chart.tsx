import ReactApexChart from 'react-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useTheme } from '@/shared/lib'
import { SkeletonLoader } from '@/shared/ui/SkeletonLoader'

export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'radialBar'

export interface ChartSeries {
  name?: string
  data: number[]
}

export interface ChartProps {
  type: ChartType
  series: ChartSeries[] | number[]
  categories?: string[]
  title?: string
  height?: number
  loading?: boolean
  options?: ApexOptions
}

export function Chart({
  type,
  series,
  categories,
  title,
  height = 300,
  loading = false,
  options,
}: ChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const foreColor = isDark ? '#cbd5e1' : '#333'
  const titleColor = isDark ? '#e2e8f0' : '#263238'

  const mergedOptions: ApexOptions = {
    chart: { toolbar: { show: false }, foreColor },
    title: title ? { text: title, style: { color: titleColor } } : undefined,
    xaxis: categories ? { categories } : undefined,
    ...options,
  }

  return (
    <div className="relative" style={{ height }}>
      <div className={loading ? 'invisible' : 'visible'}>
        <ReactApexChart
          key={`${type}-${theme}`}
          type={type}
          series={series}
          options={mergedOptions}
          height={height}
        />
      </div>
      {loading && (
        <div className="absolute inset-0">
          <SkeletonLoader heights={[height]} />
        </div>
      )}
    </div>
  )
}
