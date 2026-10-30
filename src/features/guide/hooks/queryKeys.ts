export const guideKeys = {
  all: ['guide'] as const,
  source: (path: string) => [...guideKeys.all, 'source', path] as const,
}
