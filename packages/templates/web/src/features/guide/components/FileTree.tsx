import type { TreeLine } from '../services/sourceService'

// Full class strings, so Tailwind can find them.
const INDENT = ['pl-4', 'pl-9', 'pl-14', 'pl-19', 'pl-24', 'pl-29']

interface FileTreeProps {
  caption: string
  lines: TreeLine[]
}

export function FileTree({ caption, lines }: FileTreeProps) {
  return (
    <figure className="flex flex-col overflow-hidden rounded-xl border border-border">
      <figcaption className="border-b border-border bg-surface px-4 py-2.5 text-sm font-semibold">
        {caption}
      </figcaption>
      {lines.length === 0 ? (
        <p className="px-4 py-3 font-mono text-xs text-muted-foreground">
          No files found under this folder.
        </p>
      ) : (
        <ul className="py-3 font-mono text-sm">
          {lines.map((line, index) => (
            <li
              key={index}
              className={`py-0.5 ${INDENT[Math.min(line.depth, INDENT.length - 1)] ?? 'pl-4'} ${
                line.isFolder ? 'font-semibold text-foreground' : 'text-foreground/80'
              }`}
            >
              {line.isFolder ? `${line.name}/` : line.name}
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
