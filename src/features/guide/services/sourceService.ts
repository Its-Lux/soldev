export interface Snippet {
  lines: string[]
  startLine: number
  isPartial: boolean
  markersFound: boolean
}

export interface TreeLine {
  name: string
  depth: number
  isFolder: boolean
}

/**
 * Cuts a snippet out of a file by text markers. If a marker is missing (the
 * code changed), returns the whole file with markersFound false, so the
 * guide shows a visible warning instead of the wrong lines.
 */
export function extractSnippet(code: string, from?: string, to?: string): Snippet {
  // Some files use Windows line endings (plopfile.js does); normalise first.
  const all = code.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n')
  const whole = { lines: all, startLine: 1, isPartial: false }

  if (!from) return { ...whole, markersFound: true }

  const start = all.findIndex((line) => line.includes(from))
  if (start === -1) return { ...whole, markersFound: false }

  let end = all.length - 1
  if (to) {
    const offset = all.slice(start + 1).findIndex((line) => line.includes(to))
    if (offset === -1) return { ...whole, markersFound: false }
    end = start + 1 + offset
  }

  return {
    lines: all.slice(start, end + 1),
    startLine: start + 1,
    isPartial: true,
    markersFound: true,
  }
}

/** An indented file tree for everything under `root`, folders listed once. */
export function toTreeLines(paths: string[], root: string): TreeLine[] {
  const lines: TreeLine[] = []
  const seen = new Set<string>()

  for (const path of paths.filter((candidate) => candidate.startsWith(root))) {
    const parts = path.slice(root.length).split('/')
    parts.forEach((part, depth) => {
      const key = parts.slice(0, depth + 1).join('/')
      if (seen.has(key)) return
      seen.add(key)
      lines.push({ name: part, depth, isFolder: depth < parts.length - 1 })
    })
  }

  return lines
}
