import type { Chapter } from '../../types'
import { devGuideChapters } from './devGuide'
import { generatorsChapter } from './generators'
import { mapChapter } from './map'

export const CHAPTERS: Chapter[] = [mapChapter, generatorsChapter, ...devGuideChapters]

export const CHAPTER_IDS = CHAPTERS.map((chapter) => chapter.id)

/** Every file a snippet needs, loaded once up front by the page. */
export const SNIPPET_PATHS = [
  ...new Set(
    CHAPTERS.flatMap((chapter) =>
      chapter.blocks.flatMap((block) => (block.kind === 'snippet' ? [block.path] : [])),
    ),
  ),
]
