import { parseMarkdownChapters } from '../../services/markdownService'
import type { Chapter } from '../../types'

export const DEV_GUIDE_PATH = '/docs/NEW_DEVELOPER_GUIDE.md'

const GROUP = 'Developer guide'

// Loaded eagerly, so its chapters exist on the first render and the rail and
// scroll spy treat them like the hand-written ones. The guide is the single
// source: editing the Markdown file updates these chapters on save.
const files = import.meta.glob<string>('/docs/NEW_DEVELOPER_GUIDE.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const markdown = files[DEV_GUIDE_PATH]

export const devGuideChapters: Chapter[] =
  markdown === undefined
    ? [
        {
          id: 'dev-guide-missing',
          title: 'Developer guide',
          summary: 'Not found.',
          group: GROUP,
          blocks: [
            {
              kind: 'note',
              body: '`docs/NEW_DEVELOPER_GUIDE.md` was not found, so its chapters are missing. If the file moved, update `DEV_GUIDE_PATH` and the glob in `libs/chapters/devGuide.ts`.',
            },
          ],
        },
      ]
    : parseMarkdownChapters(markdown, {
        idPrefix: 'dev',
        summary: 'From `docs/NEW_DEVELOPER_GUIDE.md`. Edit that file to change this chapter.',
        group: GROUP,
      })
