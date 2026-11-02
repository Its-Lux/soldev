/**
 * Creates a new frontend from the template.
 *
 *   yarn generate:web-app <name> [--port <number>] [--title "<Page title>"]
 *
 * 1. Copies packages/templates/web to packages/web/<name> (no installs, builds
 *    or local secrets).
 * 2. Strips everything that belongs only to the template: the paths listed in
 *    template.json, every block between template-only:start and
 *    template-only:end comments, and template.json itself.
 * 3. Checks that no code still refers to a stripped path.
 * 4. Sets the package name (@web/<name>), page title and optional dev port.
 * 5. Copies hosting/docker/_web-template to hosting/docker/<name>, replacing
 *    every __APP__ token with the name.
 * 6. Adds run/build/lint/typecheck/docker scripts for the app to the root
 *    package.json.
 *
 * Any failure rolls back everything it created or changed.
 *
 * Runs with plain Node (24+ strips TypeScript types natively), so this file
 * must stay erasable-only TypeScript: no enums, namespaces or parameter
 * properties.
 */
import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { basename, extname, join, relative, sep } from 'node:path'
import { parseArgs } from 'node:util'
import {
  DOCKER_DIR,
  NAME_PATTERN,
  PACKAGE_SCOPE,
  RESERVED_NAMES,
  ROOT,
  ROOT_PACKAGE_JSON,
  WEB_DIR,
  packageNameFor,
  rootScriptsFor,
  type PackageJson,
} from './lib/web-app.ts'

const APP_TEMPLATE_DIR = join(ROOT, 'packages', 'templates', 'web')
const DOCKER_TEMPLATE_DIR = join(ROOT, 'hosting', 'docker', '_web-template')

const APP_TOKEN = '__APP__'
const MANIFEST = 'template.json'
const MARKER_START = 'template-only:start'
const MARKER_END = 'template-only:end'

/** Never copied from the template: build output, installs, local secrets. */
const EXCLUDED_NAMES = new Set(['node_modules', 'dist', 'coverage', '.vite', '.env', '.env.local'])

/** Files read as text when stripping markers and checking references. */
const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.html',
  '.css',
  '.md',
  '.hbs',
  '.yml',
  '.yaml',
  '.conf',
  '.sh',
  '.txt',
  '.svg',
])

interface Options {
  name: string
  port: number | undefined
  title: string
}

interface Manifest {
  templateOnly?: unknown
}

class GenerationError extends Error {}

function fail(message: string): never {
  console.error(`\n  Error: ${message}\n`)
  process.exit(1)
}

function toTitle(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function detectEol(text: string): string {
  return text.includes('\r\n') ? '\r\n' : '\n'
}

function toPosix(path: string): string {
  return path.split(sep).join('/')
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readJson<T>(path: string): { data: T; eol: string } {
  const raw = readFileSync(path, 'utf8')
  return { data: JSON.parse(raw) as T, eol: detectEol(raw) }
}

function writeJson(path: string, data: unknown, eol: string): void {
  writeFileSync(path, JSON.stringify(data, null, 2).replace(/\n/g, eol) + eol, 'utf8')
}

function listTextFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      files.push(...listTextFiles(path))
    } else if (TEXT_EXTENSIONS.has(extname(entry).toLowerCase())) {
      files.push(path)
    }
  }
  return files
}

function parseOptions(): Options {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      port: { type: 'string' },
      title: { type: 'string' },
    },
  })

  const name = positionals[0]
  if (!name) {
    fail('App name is required, for example: yarn generate:web-app client')
  }
  if (!NAME_PATTERN.test(name)) {
    fail(`"${name}" must be kebab-case: lowercase letters, digits and dashes.`)
  }
  if (RESERVED_NAMES.has(name)) {
    fail(`"${name}" is reserved. Choose another name.`)
  }

  let port: number | undefined
  if (values.port !== undefined) {
    port = Number(values.port)
    if (!Number.isInteger(port) || port < 1024 || port > 65535) {
      fail('--port must be a whole number between 1024 and 65535.')
    }
  }

  return { name, port, title: values.title ?? toTitle(name) }
}

function readTemplateOnlyPaths(): string[] {
  const path = join(APP_TEMPLATE_DIR, MANIFEST)
  if (!existsSync(path)) {
    return []
  }
  const { data } = readJson<Manifest>(path)
  const list = data.templateOnly
  if (!Array.isArray(list) || !list.every((item) => typeof item === 'string')) {
    fail(`${MANIFEST} must contain "templateOnly": an array of paths.`)
  }
  for (const item of list) {
    if (item.startsWith('/') || item.split('/').includes('..')) {
      fail(`${MANIFEST}: "${item}" must be a relative path inside the template.`)
    }
  }
  return list
}

/** Removes template-only paths. Returns the ones that did not exist. */
function removeTemplateOnlyPaths(appDir: string, paths: string[]): string[] {
  const missing: string[] = []
  for (const item of paths) {
    const target = join(appDir, item)
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true })
    } else {
      missing.push(item)
    }
  }
  rmSync(join(appDir, MANIFEST), { force: true })
  return missing
}

/** Deletes every marked block, markers included. Returns the files changed. */
function stripMarkedBlocks(appDir: string): string[] {
  const changed: string[] = []
  for (const file of listTextFiles(appDir)) {
    const text = readFileSync(file, 'utf8')
    if (!text.includes(MARKER_START) && !text.includes(MARKER_END)) {
      continue
    }

    const eol = detectEol(text)
    const kept: string[] = []
    let insideFrom = 0
    text.split(/\r?\n/).forEach((line, index) => {
      const lineNumber = index + 1
      const where = `${toPosix(relative(appDir, file))}:${lineNumber}`
      if (line.includes(MARKER_START)) {
        if (insideFrom) {
          throw new GenerationError(
            `${where}: ${MARKER_START} inside the block opened on line ${insideFrom}`,
          )
        }
        insideFrom = lineNumber
      } else if (line.includes(MARKER_END)) {
        if (!insideFrom) {
          throw new GenerationError(`${where}: ${MARKER_END} without a matching ${MARKER_START}`)
        }
        insideFrom = 0
      } else if (!insideFrom) {
        kept.push(line)
      }
    })
    if (insideFrom) {
      throw new GenerationError(
        `${toPosix(relative(appDir, file))}:${insideFrom}: ${MARKER_START} is never closed`,
      )
    }

    writeFileSync(file, kept.join(eol), 'utf8')
    changed.push(toPosix(relative(appDir, file)))
  }
  return changed
}

/**
 * How a stripped path could still be referred to: its path without "src/" and
 * without the file extension (import specifiers), plus a file's own name.
 * A folder's own name alone (such as "guide") is too common to search for.
 */
function referenceTokens(item: string): string[] {
  const withoutExt = item.replace(/\.[^/.]+$/, '')
  const tokens = new Set<string>([withoutExt.replace(/^src\//, '')])
  if (extname(item)) {
    tokens.add(basename(withoutExt))
  }
  return [...tokens]
}

/**
 * Code that still refers to a stripped path fails generation. Markdown only
 * produces warnings, since prose mentions do not break the build.
 */
function findReferences(appDir: string, paths: string[]): { errors: string[]; warnings: string[] } {
  const patterns = paths.flatMap((item) =>
    referenceTokens(item).map((token) => ({
      item,
      regex: new RegExp(`(?<![A-Za-z0-9_])${escapeRegExp(token)}(?![A-Za-z0-9_-])`),
    })),
  )
  const errors: string[] = []
  const warnings: string[] = []
  for (const file of listTextFiles(appDir)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    const isProse = extname(file).toLowerCase() === '.md'
    lines.forEach((line, index) => {
      const hit = patterns.find(({ regex }) => regex.test(line))
      if (hit) {
        const message = `${toPosix(relative(appDir, file))}:${index + 1} still refers to ${hit.item}`
        ;(isProse ? warnings : errors).push(message)
      }
    })
  }
  return { errors, warnings }
}

function patchPackageJson(appDir: string, options: Options): string[] {
  const warnings: string[] = []
  const path = join(appDir, 'package.json')
  const { data: pkg, eol } = readJson<PackageJson>(path)

  pkg.name = packageNameFor(options.name)

  if (options.port !== undefined) {
    const dev = pkg.scripts?.dev
    if (pkg.scripts && dev === 'vite') {
      pkg.scripts.dev = `vite --port ${options.port} --strictPort`
    } else {
      warnings.push(
        `scripts.dev is "${dev ?? 'missing'}", not plain "vite". Port not set; add --port ${options.port} by hand.`,
      )
    }
  }

  writeJson(path, pkg, eol)
  return warnings
}

function patchIndexHtml(appDir: string, title: string): string[] {
  const path = join(appDir, 'index.html')
  if (!existsSync(path)) {
    return ['index.html not found; page title not set.']
  }
  const html = readFileSync(path, 'utf8')
  if (!/<title>[\s\S]*?<\/title>/.test(html)) {
    return ['No <title> tag in index.html; page title not set.']
  }
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  writeFileSync(
    path,
    html.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`),
    'utf8',
  )
  return []
}

/** Copies the Docker template, replacing every __APP__ token with the app name. */
function copyDockerTemplate(dockerDir: string, name: string): string[] {
  cpSync(DOCKER_TEMPLATE_DIR, dockerDir, { recursive: true })

  let replaced = 0
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry)
      if (statSync(path).isDirectory()) {
        walk(path)
        continue
      }
      const text = readFileSync(path, 'utf8')
      if (text.includes(APP_TOKEN)) {
        writeFileSync(path, text.split(APP_TOKEN).join(name), 'utf8')
        replaced += 1
      }
    }
  }
  walk(dockerDir)

  return replaced === 0
    ? [`No ${APP_TOKEN} tokens found in the Docker template; check hosting/docker/${name} by hand.`]
    : []
}

/** Adds root scripts for the app, never overwriting an existing one. */
function addRootScripts(name: string): string[] {
  const warnings: string[] = []
  const { data: pkg, eol } = readJson<PackageJson>(ROOT_PACKAGE_JSON)
  const scripts = pkg.scripts ?? {}
  for (const [key, value] of Object.entries(rootScriptsFor(name))) {
    if (key in scripts) {
      warnings.push(`Root script "${key}" already exists; left unchanged.`)
    } else {
      scripts[key] = value
    }
  }
  pkg.scripts = scripts
  writeJson(ROOT_PACKAGE_JSON, pkg, eol)
  return warnings
}

function main(): void {
  const options = parseOptions()
  const appDir = join(WEB_DIR, options.name)
  const dockerDir = join(DOCKER_DIR, options.name)

  if (!existsSync(APP_TEMPLATE_DIR)) fail(`App template not found at ${APP_TEMPLATE_DIR}`)
  if (!existsSync(DOCKER_TEMPLATE_DIR)) fail(`Docker template not found at ${DOCKER_TEMPLATE_DIR}`)
  if (!existsSync(ROOT_PACKAGE_JSON)) fail(`Root package.json not found at ${ROOT_PACKAGE_JSON}`)
  if (existsSync(appDir)) fail(`packages/web/${options.name} already exists.`)
  if (existsSync(dockerDir)) fail(`hosting/docker/${options.name} already exists.`)

  const templateOnly = readTemplateOnlyPaths()
  const rootPackageBackup = readFileSync(ROOT_PACKAGE_JSON, 'utf8')
  const warnings: string[] = []
  let stripped: string[] = []

  try {
    cpSync(APP_TEMPLATE_DIR, appDir, {
      recursive: true,
      filter: (source) => !EXCLUDED_NAMES.has(basename(source)),
    })

    const missing = removeTemplateOnlyPaths(appDir, templateOnly)
    for (const item of missing) warnings.push(`${MANIFEST} lists "${item}", which does not exist.`)
    stripped = stripMarkedBlocks(appDir)

    const references = findReferences(appDir, templateOnly)
    if (references.errors.length > 0) {
      throw new GenerationError(
        `code still refers to template-only paths:\n    ${references.errors.join('\n    ')}\n  Wrap those lines in template-only markers, or add the files to ${MANIFEST}.`,
      )
    }
    warnings.push(...references.warnings.map((w) => `${w} (prose only, update when convenient)`))

    warnings.push(...patchPackageJson(appDir, options))
    warnings.push(...patchIndexHtml(appDir, options.title))
    warnings.push(...copyDockerTemplate(dockerDir, options.name))
    warnings.push(...addRootScripts(options.name))
  } catch (error) {
    // Leave nothing half-created behind.
    rmSync(appDir, { recursive: true, force: true })
    rmSync(dockerDir, { recursive: true, force: true })
    writeFileSync(ROOT_PACKAGE_JSON, rootPackageBackup, 'utf8')
    const message = error instanceof Error ? error.message : String(error)
    fail(`Generation failed and was rolled back: ${message}`)
  }

  console.log(`\n  Created packages/web/${options.name} (${PACKAGE_SCOPE}/${options.name})`)
  console.log(`  Created hosting/docker/${options.name}`)
  console.log(
    `  Removed ${templateOnly.length} template-only path(s); stripped markers in ${stripped.length} file(s)`,
  )
  console.log(
    `  Added run:${options.name}, build:${options.name}, lint:${options.name}, typecheck:${options.name} and docker:${options.name}:* to the root package.json`,
  )
  for (const warning of warnings) {
    console.warn(`  Warning: ${warning}`)
  }
  console.log('\n  Next steps:')
  console.log('    1. yarn install')
  console.log(
    `    2. yarn typecheck:${options.name} && yarn lint:${options.name} && yarn build:${options.name}`,
  )
  console.log(`    3. Copy .env.example to .env in packages/web/${options.name}`)
  console.log(`    4. yarn run:${options.name}\n`)
}

main()
