interface SkeletonLoaderProps {
  heights: number[]
}

export function SkeletonLoader({ heights }: SkeletonLoaderProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  )
}
