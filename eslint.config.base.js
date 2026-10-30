import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

/**
 * Environment-neutral lint rules shared by every package.
 * Browser, React and Node specifics belong in each package's own config.
 * Prettier comes last so it switches off any formatting rules above it.
 */
export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'] },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
  },
  prettier,
)