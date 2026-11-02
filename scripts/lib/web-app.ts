/**
 * Shared by generate-web-app.ts and remove-web-app.ts, so the two always agree
 * on where an app lives and which root scripts belong to it.
 */
import { join, resolve } from 'node:path'

export const ROOT = resolve(import.meta.dirname, '..', '..')
export const WEB_DIR = join(ROOT, 'packages', 'web')
export const DOCKER_DIR = join(ROOT, 'hosting', 'docker')
export const ROOT_PACKAGE_JSON = join(ROOT, 'package.json')

export const PACKAGE_SCOPE = '@web'
export const NAME_PATTERN = /^[a-z][a-z0-9-]*[a-z0-9]$/
export const RESERVED_NAMES = new Set(['api', 'templates', 'template', 'web'])

export interface PackageJson {
  name?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  [key: string]: unknown
}

export const packageNameFor = (name: string): string => `${PACKAGE_SCOPE}/${name}`

/** The root scripts the generator adds for an app, and the remover takes away. */
export function rootScriptsFor(name: string): Record<string, string> {
  const workspace = packageNameFor(name)
  return {
    [`run:${name}`]: `yarn workspace ${workspace} dev`,
    [`build:${name}`]: `yarn workspace ${workspace} build`,
    [`lint:${name}`]: `yarn workspace ${workspace} lint`,
    [`typecheck:${name}`]: `yarn workspace ${workspace} typecheck`,
    [`docker:${name}:build`]: `docker build -f hosting/docker/${name}/Dockerfile -t soldev-${name} .`,
    [`docker:${name}:verify`]: `bash hosting/docker/${name}/verify-docker.sh`,
  }
}
