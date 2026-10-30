import type { Chapter, GuideBlock } from '../types'

export interface MarkdownChapterOptions {
  /** Prefixed to each chapter id, so ids cannot clash with other chapters. */
  idPrefix: string
  summary: string
  group?: string
}

const FENCE = /^```(\S*)\s*$/
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/
const TABLE_SEPARATOR = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/** Cells of one table row. A pipe written as \| stays in its cell. */
const splitRow = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replace(/\\\|/g, '|'))

/**
 * Turns a Markdown document into guide chapters, one per `## ` heading.
 * Anything before the first `## ` becomes an opening chapter named after the
 * `# ` title. A leading number such as "3. " is dropped from each heading,
 * because the page numbers chapters itself.
 *
 * Supports the subset the project's docs use: headings, paragraphs, lists,
 * tables and fenced code. Lines wrapped inside a paragraph or list item are
 * joined. `### ` and deeper headings become bold lines.
 */
export function parseMarkdownChapters(
  markdown: string,
  options: MarkdownChapterOptions,
): Chapter[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const sections: { title: string; blocks: GuideBlock[] }[] = []
  const intro: GuideBlock[] = []
  let documentTitle: string | undefined
  let paragraph: string[] = []
  let list: string[] | undefined

  const target = (): GuideBlock[] => sections[sections.length - 1]?.blocks ?? intro

  const flushParagraph = () => {
    if (paragraph.length > 0) target().push({ kind: 'text', body: paragraph.join(' ') })
    paragraph = []
  }
  const flushList = () => {
    if (list !== undefined && list.length > 0) target().push({ kind: 'list', items: list })
    list = undefined
  }
  const flush = () => {
    flushParagraph()
    flushList()
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''

    const fence = FENCE.exec(line)
    if (fence) {
      flush()
      const code: string[] = []
      i++
      while (i < lines.length && !/^```\s*$/.test(lines[i] ?? '')) {
        code.push(lines[i] ?? '')
        i++
      }
      const language = fence[1]
      target().push({ kind: 'code', code: code.join('\n'), ...(language ? { language } : {}) })
      continue
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      flush()
      const level = heading[1]?.length ?? 1
      const text = (heading[2] ?? '').trim()
      if (level === 1) {
        documentTitle ??= text
      } else if (level === 2) {
        sections.push({ title: text.replace(/^\d+\.\s+/, ''), blocks: [] })
      } else {
        target().push({ kind: 'text', body: `**${text}**` })
      }
      continue
    }

    if (line.trim().startsWith('|') && TABLE_SEPARATOR.test(lines[i + 1] ?? '')) {
      flush()
      const headers = splitRow(line)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
        rows.push(splitRow(lines[i] ?? ''))
        i++
      }
      i--
      target().push({ kind: 'table', headers, rows })
      continue
    }

    const item = LIST_ITEM.exec(line)
    if (item) {
      flushParagraph()
      list ??= []
      list.push((item[1] ?? '').trim())
      continue
    }

    if (line.trim() === '') {
      flush()
      continue
    }

    // An indented line straight after a list item continues that item.
    if (list !== undefined && /^\s+\S/.test(line)) {
      const last = list.length - 1
      list[last] = `${list[last] ?? ''} ${line.trim()}`
      continue
    }

    flushList()
    paragraph.push(line.trim())
  }
  flush()

  const chapters = [
    ...(intro.length > 0 ? [{ title: documentTitle ?? 'Introduction', blocks: intro }] : []),
    ...sections,
  ]

  const usedIds = new Set<string>()
  return chapters.map(({ title, blocks }) => {
    const base = `${options.idPrefix}-${slugify(title) || 'section'}`
    let id = base
    for (let n = 2; usedIds.has(id); n++) id = `${base}-${n}`
    usedIds.add(id)
    return {
      id,
      title,
      summary: options.summary,
      ...(options.group !== undefined ? { group: options.group } : {}),
      blocks,
    }
  })
}
