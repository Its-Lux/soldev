import type { ReactNode } from 'react'
import { InlineText } from './InlineText'

interface GuideChapterProps {
  id: string
  number: string
  title: string
  summary: string
  children: ReactNode
}

export function GuideChapter({ id, number, title, summary, children }: GuideChapterProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="flex scroll-mt-8 flex-col gap-5 border-t border-foreground pt-4"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-3.5">
          <span className="font-mono text-sm text-muted-foreground">{number}</span>
          <h2
            id={`${id}-heading`}
            tabIndex={-1}
            className="text-3xl font-extrabold tracking-tight focus:outline-none"
          >
            {title}
          </h2>
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          <InlineText text={summary} />
        </p>
      </div>
      {children}
    </section>
  )
}
