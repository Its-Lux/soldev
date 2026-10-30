export const todosKeys = {
  all: ['todos'] as const,
  lists: () => [...todosKeys.all, 'list'] as const,
  details: () => [...todosKeys.all, 'detail'] as const,
  detail: (id: string) => [...todosKeys.details(), id] as const,
}
