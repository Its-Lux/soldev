import { useEffect, useState } from 'react'

export function useScrollSpy(ids: readonly string[], watchKey: unknown): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>()
  const idsKey = ids.join(',')

  useEffect(() => {
    if (watchKey === undefined) return

    const orderedIds = idsKey.split(',')
    const elements = orderedIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const first = orderedIds.find((id) => visible.has(id))
        if (first) setActiveId(first)
      },
      { rootMargin: '-33% 0px -62% 0px' },
    )

    elements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [idsKey, watchKey])

  return activeId
}
