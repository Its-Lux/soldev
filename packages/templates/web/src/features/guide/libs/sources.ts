const loaders = import.meta.glob<string>(
  ['/plopfile.js', '/plop-templates/*.hbs', '/src/**/*.{ts,tsx,css}'],
  { query: '?raw', import: 'default' },
)

export const SOURCE_PATHS = Object.keys(loaders).sort()

export function loadSource(path: string): Promise<string> {
  const loader = loaders[path]
  return loader ? loader() : Promise.reject(new Error(`No source file at ${path}`))
}
