import type { GuideBlock } from '../types'
import { extractSnippet, toTreeLines } from '../services/sourceService'
import { CodeBlock } from './CodeBlock'
import { FileTree } from './FileTree'
import { GuideTable } from './GuideTable'
import { InlineText } from './InlineText'

const LANGUAGE_NAMES: Record<string, string> = {
  bash: 'Shell',
  sh: 'Shell',
  ts: 'TypeScript',
  tsx: 'TypeScript',
  js: 'JavaScript',
  json: 'JSON',
}

interface GuideBlocksProps {
  blocks: GuideBlock[]
  sources: Map<string, string>
  filePaths: string[]
  isPending: boolean
}

export function GuideBlocks({ blocks, sources, filePaths, isPending }: GuideBlocksProps) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'text':
            return (
              <p key={index} className="text-pretty text-lg leading-relaxed text-foreground/80">
                <InlineText text={block.body} />
              </p>
            )
          case 'list':
            return (
              <ul
                key={index}
                className="flex list-disc flex-col gap-1.5 pl-6 text-lg leading-relaxed text-foreground/80"
              >
                {block.items.map((item) => (
                  <li key={item}>
                    <InlineText text={item} />
                  </li>
                ))}
              </ul>
            )
          case 'note':
            return (
              <aside
                key={index}
                className="rounded-xl border-l-4 border-foreground bg-surface px-5 py-4 text-base leading-relaxed text-foreground/80"
              >
                <InlineText text={block.body} />
              </aside>
            )
          case 'tree':
            return (
              <FileTree
                key={index}
                caption={block.caption}
                lines={toTreeLines(filePaths, block.root)}
              />
            )
          case 'code':
            return (
              <CodeBlock
                key={index}
                caption={
                  block.language === undefined
                    ? 'Example'
                    : (LANGUAGE_NAMES[block.language] ?? block.language)
                }
                snippet={extractSnippet(block.code)}
                isPending={false}
              />
            )
          case 'table':
            return <GuideTable key={index} headers={block.headers} rows={block.rows} />
          case 'snippet': {
            const code = sources.get(block.path)
            return (
              <CodeBlock
                key={index}
                path={block.path}
                caption={block.caption}
                snippet={
                  code === undefined ? undefined : extractSnippet(code, block.from, block.to)
                }
                isPending={isPending}
              />
            )
          }
          default: {
            const unreachable: never = block
            return unreachable
          }
        }
      })}
    </>
  )
}
