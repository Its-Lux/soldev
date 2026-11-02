/**
 * Removes a frontend created by generate-web-app.ts.
 *
 *   yarn remove:web-app <name> [--yes] [--force]
 *
 * Deletes packages/web/<name> and hosting/docker/<name>, and the root scripts
 * the generator added for the app. Everything is checked before anything is
 * deleted, and it refuses when:
 *
 * - the folder is not an app this generator made (its package.json is not
 *   named @web/<name>), which protects packages/web/api and hand-made packages
 * - another workspace depends on the app
 * - the app's folders have uncommitted changes, which deletion would lose
 *   (--force overrides this one check)
 *
 * It asks you to type the name to confirm, unless --yes is given. Committed
 * files stay recoverable through git until the deletion is committed.
 *
 * Runs with plain Node (24+ strips TypeScript types natively), so this file
 * must stay erasable-only TypeScript.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { stdin, stdout } from 'node:process'
import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import {
  DOCKER_DIR,
  NAME_PATTERN,
  RESERVED_NAMES,
  ROOT,
  ROOT_PACKAGE_JSON,
  WEB_DIR,
  packageNameFor,
  rootScriptsFor,
  type PackageJson,
} from './lib/web-app.ts'

interface Options {
  name: string
  yes: boolean
  force: boolean
}

function fail(message: string): never {
  console.error(`\n  Error: ${message}\n`)
  process.exit(1)
}

const toPosix = (path: string): string => path.split(sep).join('/')
const fromRoot = (path: string): string => toPosix(relative(ROOT, path))

function readPackageJson(path: string): { data: PackageJson; eol: string } {
  const raw = readFileSync(path, 'utf8')
  return { data: JSON.parse(raw) as PackageJson, eol: raw.includes('\r\n') ? '\r\n' : '\n' }
}

function parseOptions(): Options {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      yes: { type: 'boolean', default: false },
      force: { type: 'boolean', default: false },
    },
  })
  const name = positionals[0]
  if (!name) fail('App name is required, for example: yarn remove:web-app client')
  if (!NAME_PATTERN.test(name)) fail(`"${name}" is not a valid app name.`)
  if (RESERVED_NAMES.has(name))
    fail(`"${name}" is reserved and cannot be removed with this script.`)
  return { name, yes: values.yes, force: values.force }
}

/** Workspaces (other than the app itself) that list the app as a dependency. */
function findDependents(packageName: string, appDir: string): string[] {
  const dependents: string[] = []
  const packagesDir = join(ROOT, 'packages')
  if (!existsSync(packagesDir)) return dependents
  for (const group of readdirSync(packagesDir)) {
    const groupDir = join(packagesDir, group)
    if (!statSync(groupDir).isDirectory()) continue
    for (const entry of readdirSync(groupDir)) {
      const dir = join(groupDir, entry)
      const manifest = join(dir, 'package.json')
      if (dir === appDir || !existsSync(manifest)) continue
      const { data } = readPackageJson(manifest)
      const lists = [data.dependencies, data.devDependencies, data.peerDependencies]
      if (lists.some((list) => list !== undefined && packageName in list)) {
        dependents.push(`${fromRoot(dir)} (${data.name ?? 'unnamed'})`)
      }
    }
  }
  return dependents
}

/** Uncommitted or untracked files under the given paths, or null if git is unavailable. */
function uncommittedChanges(paths: string[]): string[] | null {
  try {
    const output = execFileSync('git', ['status', '--porcelain', '--', ...paths], {
      cwd: ROOT,
      encoding: 'utf8',
    })
    return output.split('\n').filter((line) => line.trim() !== '')
  } catch {
    return null
  }
}

async function confirm(name: string): Promise<boolean> {
  const rl = createInterface({ input: stdin, output: stdout })
  try {
    const answer = await rl.question(
      `\n  Type "${name}" to delete it, or anything else to cancel: `,
    )
    return answer.trim() === name
  } finally {
    rl.close()
  }
}

async function main(): Promise<void> {
  const options = parseOptions()
  const { name } = options
  const packageName = packageNameFor(name)
  const appDir = join(WEB_DIR, name)
  const dockerDir = join(DOCKER_DIR, name)
  const warnings: string[] = []

  // 1. Is this an app the generator made?
  const appExists = existsSync(appDir)
  if (appExists) {
    const manifest = join(appDir, 'package.json')
    if (!existsSync(manifest))
      fail(`${fromRoot(appDir)} has no package.json, so it is not a generated app.`)
    const actual = readPackageJson(manifest).data.name
    if (actual !== packageName) {
      fail(
        `${fromRoot(appDir)} is named "${actual ?? 'unnamed'}", not "${packageName}". Only generated apps can be removed.`,
      )
    }
  }
  const dockerExists = existsSync(dockerDir)

  // 2. Which root scripts belong to it? Only exact matches are removed.
  const { data: rootPkg, eol } = readPackageJson(ROOT_PACKAGE_JSON)
  const scripts = rootPkg.scripts ?? {}
  const removable: string[] = []
  for (const [key, value] of Object.entries(rootScriptsFor(name))) {
    if (!(key in scripts)) continue
    if (scripts[key] === value) {
      removable.push(key)
    } else {
      warnings.push(`Root script "${key}" was changed after generation; left in place.`)
    }
  }

  if (!appExists && !dockerExists && removable.length === 0) {
    fail(
      `Nothing to remove: no packages/web/${name}, no hosting/docker/${name} and no matching root scripts.`,
    )
  }

  // 3. Would removing it break something?
  const dependents = findDependents(packageName, appDir)
  if (dependents.length > 0) {
    fail(
      `These workspaces depend on ${packageName}; remove the dependency first:\n    ${dependents.join('\n    ')}`,
    )
  }

  // 4. Would deleting lose work?
  const targets = [appDir, dockerDir].filter((dir) => existsSync(dir)).map(fromRoot)
  const changes = uncommittedChanges(targets)
  if (changes === null) {
    warnings.push('Could not run git, so uncommitted changes were not checked.')
  } else if (changes.length > 0 && !options.force) {
    fail(
      `Uncommitted changes would be lost (commit them, or rerun with --force):\n    ${changes.join('\n    ')}`,
    )
  }

  const composeFile = join(ROOT, 'docker-compose.yml')
  if (
    existsSync(composeFile) &&
    readFileSync(composeFile, 'utf8').includes(`hosting/docker/${name}/`)
  ) {
    warnings.push(
      `docker-compose.yml still refers to hosting/docker/${name}/; remove its service by hand.`,
    )
  }

  // 5. Show the plan and confirm.
  console.log(`\n  This will remove ${packageName}:`)
  if (appExists) console.log(`    - ${fromRoot(appDir)}/`)
  if (dockerExists) console.log(`    - ${fromRoot(dockerDir)}/`)
  for (const key of removable) console.log(`    - root script "${key}"`)
  for (const warning of warnings) console.warn(`  Warning: ${warning}`)

  if (!options.yes && !(await confirm(name))) {
    console.log('\n  Cancelled. Nothing was changed.\n')
    return
  }

  // 6. Remove. Root scripts first, so a failed deletion leaves nothing pointing at it.
  if (removable.length > 0) {
    for (const key of removable) delete scripts[key]
    rootPkg.scripts = scripts
    writeFileSync(
      ROOT_PACKAGE_JSON,
      JSON.stringify(rootPkg, null, 2).replace(/\n/g, eol) + eol,
      'utf8',
    )
  }
  try {
    rmSync(appDir, { recursive: true, force: true })
    rmSync(dockerDir, { recursive: true, force: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    fail(`Deleting failed partway: ${message}. Committed files can be restored with git.`)
  }

  console.log(`\n  Removed ${packageName}.`)
  console.log('\n  Next steps:')
  console.log('    1. yarn install   (drops the workspace from yarn.lock)')
  console.log('    2. git status     (review the deletions)')
  console.log(`    3. git add -A && git commit -m "chore: remove the ${name} frontend"\n`)
}

await main()
