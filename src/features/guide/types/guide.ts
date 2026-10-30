/** One piece of a chapter. Chapters are data, rendered by GuideBlocks. */
export type GuideBlock =
  | { kind: 'text'; body: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'note'; body: string }
  | { kind: 'tree'; root: string; caption: string }
  /** Code written in the chapter itself, not read from a file. */
  | { kind: 'code'; code: string; language?: string }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | {
      kind: 'snippet'
      path: string
      caption: string
      /** Text on the first line to show. Omit to show the whole file. */
      from?: string
      /** Text on the last line to show, searched after `from`. */
      to?: string
    }

export interface Chapter {
  id: string
  title: string
  summary: string
  /** Rail heading for a run of chapters. Omit for the walkthrough chapters. */
  group?: string
  blocks: GuideBlock[]
}
