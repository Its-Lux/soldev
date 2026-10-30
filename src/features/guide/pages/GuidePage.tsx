import { useScrollSpy } from '@/shared/lib/useScrollSpy'
import { GuideBlocks } from '../components/GuideBlocks'
import { GuideChapter } from '../components/GuideChapter'
import { GuideRail } from '../components/GuideRail'
import { InlineText } from '../components/InlineText'
import { useSources } from '../hooks/useSources'
import { CHAPTERS, CHAPTER_IDS, SNIPPET_PATHS } from '../libs/chapters'
import { SOURCE_PATHS } from '../libs/sources'

const INTRO =
  "A walk through the template, using the `todos` feature as the worked example, followed by the developer guide. Snippets are read from the project's own files, and the developer guide from `docs/NEW_DEVELOPER_GUIDE.md`, so both always match the repo."

export function GuidePage() {
  const { sources, isPending } = useSources(SNIPPET_PATHS)
  const activeId = useScrollSpy(CHAPTER_IDS, 'guide')

  return (
    <div className="flex items-start gap-12 bg-background px-6 pb-20 pt-10 text-foreground lg:px-14">
      <GuideRail chapters={CHAPTERS} activeId={activeId} />
      <div className="flex min-w-0 max-w-3xl flex-1 flex-col gap-16">
        <header className="flex flex-col gap-4">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Development only &middot; read live from the source
          </p>
          <h1 className="text-5xl font-extrabold leading-none tracking-tight lg:text-6xl">
            How this template works
          </h1>
          <p className="text-pretty text-xl leading-relaxed text-foreground/80">
            <InlineText text={INTRO} />
          </p>
        </header>
        {CHAPTERS.map((chapter, index) => (
          <GuideChapter
            key={chapter.id}
            id={chapter.id}
            number={String(index + 1).padStart(2, '0')}
            title={chapter.title}
            summary={chapter.summary}
          >
            <GuideBlocks
              blocks={chapter.blocks}
              sources={sources}
              filePaths={SOURCE_PATHS}
              isPending={isPending}
            />
          </GuideChapter>
        ))}
      </div>
    </div>
  )
}
