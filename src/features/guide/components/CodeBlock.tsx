import { useState } from 'react'
import type { Snippet } from '../services/sourceService'

interface CodeBlockProps {
  /** The file the snippet came from. Omit for code written in the chapter. */
  path?: string
  caption: string
  snippet: Snippet | undefined
  isPending: boolean
}

export function CodeBlock({ path, caption, snippet, isPending }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const endLine = snippet ? snippet.startLine + snippet.lines.length - 1 : 0

  const copy = async () => {
    if (!snippet) return
    try {
      await navigator.clipboard.writeText(snippet.lines.join('\n'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can be blocked; the code can still be selected by hand.
    }
  }

  return (
    <figure className="flex flex-col overflow-hidden rounded-xl border border-border">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border bg-surface px-4 py-2.5">
        <span className="text-sm font-semibold">{caption}</span>
        <span className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          {path?.slice(1)}
          {snippet?.isPartial && ` \u00B7 lines ${snippet.startLine}\u2013${endLine}`}
          <button
            type="button"
            onClick={() => void copy()}
            disabled={!snippet}
            className="rounded-full border border-border px-2.5 py-1 hover:text-foreground disabled:opacity-50"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </span>
      </figcaption>

      {snippet && !snippet.markersFound && (
        <p className="border-b border-border px-4 py-2 font-mono text-xs text-muted-foreground">
          The snippet markers no longer match this file, so the whole file is shown. Update this
          chapter&apos;s from/to text.
        </p>
      )}

      {snippet ? (
        <pre
          style={{ counterReset: `line ${snippet.startLine - 1}` }}
          className="overflow-x-auto py-3 font-mono text-sm leading-relaxed"
        >
          <code>
            {snippet.lines.map((line, index) => (
              <span key={index} className="code-line">
                {line || ' '}
              </span>
            ))}
          </code>
        </pre>
      ) : isPending ? (
        <span
          aria-hidden="true"
          className="m-4 block h-24 rounded-xs bg-muted motion-safe:animate-pulse"
        />
      ) : (
        <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
          Couldn&apos;t load this file.
        </p>
      )}
    </figure>
  )
}
