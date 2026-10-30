import { Fragment, type MouseEvent } from 'react'
import type { Chapter } from '../types'

function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  document.getElementById(`${id}-heading`)?.focus({ preventScroll: true })
}

interface GuideRailProps {
  chapters: Chapter[]
  activeId: string | undefined
}

export function GuideRail({ chapters, activeId }: GuideRailProps) {
  return (
    <nav
      aria-label="Chapters"
      className="sticky top-8 hidden max-h-[calc(100vh-4rem)] w-56 flex-none flex-col self-start overflow-y-auto lg:flex"
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Chapters
      </p>
      {chapters.map((chapter, index) => {
        const isActive = chapter.id === activeId
        // A heading above the first chapter of each group, such as the
        // developer guide's chapters.
        const startsGroup =
          chapter.group !== undefined && chapter.group !== chapters[index - 1]?.group
        return (
          <Fragment key={chapter.id}>
            {startsGroup && (
              <p className="mb-3 mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                {chapter.group}
              </p>
            )}
            <a
              href={`#${chapter.id}`}
              onClick={(event) => jumpTo(event, chapter.id)}
              aria-current={isActive ? 'location' : undefined}
              className={`flex items-baseline gap-3 py-1.5 font-mono text-sm transition duration-300 ease-out motion-reduce:transition-none ${
                isActive
                  ? 'translate-x-1 font-semibold text-foreground'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              <span className="text-label text-hud">{String(index + 1).padStart(2, '0')}</span>
              {chapter.title}
            </a>
          </Fragment>
        )
      })}
    </nav>
  )
}
