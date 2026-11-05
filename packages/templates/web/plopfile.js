import fs from 'node:fs'
import path from 'node:path'

export default function (plop) {
  // Plop resolves action paths from this file's folder, but plain fs calls
  // resolve from wherever the command was started. Anchor every fs path here
  // so the generators behave the same from the package, the repo root or an IDE.
  const fromHere = (...parts) => path.join(plop.getPlopfilePath(), ...parts)
  const pascalCase = plop.getHelper('pascalCase')

  // Shared contracts live in @libs/types. Apps and the template sit at the same
  // depth (packages/<group>/<name>), so this relative path works from either.
  const LIBS_TYPES = '../../libs/types'
  const CONTRACT_INDEX = `${LIBS_TYPES}/src/index.ts`
  const CONTRACT_EXPORT_ANCHOR = '// plop:contract-export'
  const CONTRACT_MUTATION_ANCHOR = '// plop:contract-mutation'
  const contractPathFor = (name) => `${LIBS_TYPES}/src/${name}/${name}.types.ts`
  const readIfExists = (relativePath) =>
    fs.existsSync(fromHere(relativePath)) ? fs.readFileSync(fromHere(relativePath), 'utf-8') : null

  /**
   * Problems that would stop a shared contract from working, checked before
   * any file is written: the package must depend on @libs/types, the contract
   * index must carry its anchor, and an existing contract file must carry its
   * mutation anchor when mutations are to be added to it.
   */
  const contractSetupProblems = (name, addsMutations) => {
    const problems = []
    const manifest = JSON.parse(fs.readFileSync(fromHere('package.json'), 'utf-8'))
    const deps = { ...manifest.dependencies, ...manifest.devDependencies }
    if (!deps['@libs/types']) {
      problems.push(
        'this package does not depend on @libs/types (add "@libs/types": "workspace:*" to devDependencies)',
      )
    }
    const index = readIfExists(CONTRACT_INDEX)
    if (index === null || !index.includes(CONTRACT_EXPORT_ANCHOR)) {
      problems.push(`${CONTRACT_INDEX} (needs "${CONTRACT_EXPORT_ANCHOR}")`)
    }
    const contract = readIfExists(contractPathFor(name))
    if (addsMutations && contract !== null && !contract.includes(CONTRACT_MUTATION_ANCHOR)) {
      problems.push(`${contractPathFor(name)} (needs "${CONTRACT_MUTATION_ANCHOR}")`)
    }
    return problems
  }

  /**
   * Appends one mutation's Request/Response pair to a feature's contract file,
   * unless the contract already has that action (a reused contract).
   */
  const contractMutationAction = (mutationName) => ({
    type: 'append',
    path: `${LIBS_TYPES}/src/{{name}}/{{name}}.types.ts`,
    pattern: CONTRACT_MUTATION_ANCHOR,
    templateFile: 'plop-templates/contractMutation.hbs',
    data: { mutationName },
    skip: (data) =>
      readIfExists(contractPathFor(data.name))?.includes(`// POST /${data.name}/${mutationName}`)
        ? `Skipped: ${mutationName} is already in the contract`
        : undefined,
  })

  plop.setHelper('includes', (array, value) => array.includes(value))
  plop.setHelper('eq', (a, b) => a === b)

  const navLinkPrompts = [
    {
      type: 'list',
      name: 'navPlacement',
      message: 'Where should this nav link go?',
      choices: [
        { name: 'Top-level (no dropdown)', value: 'top' },
        { name: 'Add to an existing dropdown group', value: 'existingGroup' },
        { name: 'Create a new dropdown group with this as its first item', value: 'newGroup' },
        {
          name: 'No nav link (route only, reached from within a feature, e.g. a detail page)',
          value: 'none',
        },
      ],
      default: 'top',
    },
    {
      type: 'input',
      name: 'existingGroupName',
      message: 'Existing group slug to add to:',
      when: (answers) => answers.navPlacement === 'existingGroup',
      validate: (input) => {
        const layoutPath = 'src/app/layout/Layout.tsx'
        if (!fs.existsSync(fromHere(layoutPath))) return `Could not find ${layoutPath}.`
        const content = fs.readFileSync(fromHere(layoutPath), 'utf-8')
        const marker = `// plop:nav-group:${input}`
        return content.includes(marker)
          ? true
          : `No group "${input}" found (looking for "${marker}"). Check the slug, or choose "Create a new dropdown group" instead.`
      },
    },
    {
      type: 'input',
      name: 'groupName',
      message: 'New group slug, used internally for future additions (lowercase, e.g. "reports"):',
      when: (answers) => answers.navPlacement === 'newGroup',
      validate: (input) => {
        const layoutPath = 'src/app/layout/Layout.tsx'
        if (fs.existsSync(fromHere(layoutPath))) {
          const content = fs.readFileSync(fromHere(layoutPath), 'utf-8')
          if (content.includes(`// plop:nav-group:${input}`)) {
            return `A group "${input}" already exists. Pick a different slug or choose "Add to an existing dropdown group".`
          }
        }
        return true
      },
    },
    {
      type: 'input',
      name: 'groupLabel',
      message: 'Display label for the new group (e.g. "Reports"):',
      when: (answers) => answers.navPlacement === 'newGroup',
    },
    {
      type: 'input',
      name: 'groupIconName',
      message: 'react-icons component name for the group trigger (e.g. "FaFolder"):',
      when: (answers) => answers.navPlacement === 'newGroup',
    },
    {
      type: 'input',
      name: 'groupIconPackage',
      message: 'react-icons package/subfolder for the group icon (e.g. "fa"):',
      when: (answers) => answers.navPlacement === 'newGroup',
    },
    {
      type: 'input',
      name: 'iconName',
      message: 'react-icons component name for the nav link (e.g. "FaHome"):',
      when: (answers) => answers.navPlacement !== 'none',
    },
    {
      type: 'input',
      name: 'iconPackage',
      message: 'react-icons package/subfolder the icon lives in (e.g. "fa", "md", "hi2"):',
      when: (answers) => answers.navPlacement !== 'none',
    },
  ]

  const buildNavLinkActions = (answers) => {
    if (answers.navPlacement === 'none') {
      return []
    }

    const actions = [
      {
        type: 'append',
        path: 'src/app/layout/Layout.tsx',
        pattern: '// plop:nav-icon-import',
        templateFile: 'plop-templates/navLinkIconImport.hbs',
      },
    ]

    if (answers.navPlacement === 'newGroup') {
      actions.push(
        {
          type: 'append',
          path: 'src/app/layout/Layout.tsx',
          pattern: '// plop:nav-icon-import',
          templateFile: 'plop-templates/navGroupIconImport.hbs',
        },
        {
          type: 'append',
          path: 'src/app/layout/Layout.tsx',
          pattern: '// plop:nav-link',
          templateFile: 'plop-templates/navLinkGroup.hbs',
        },
      )
    } else if (answers.navPlacement === 'existingGroup') {
      actions.push({
        type: 'modify',
        path: 'src/app/layout/Layout.tsx',
        pattern: `// plop:nav-group:${answers.existingGroupName}`,
        templateFile: 'plop-templates/navLinkGroupChild.hbs',
      })
    } else {
      actions.push({
        type: 'append',
        path: 'src/app/layout/Layout.tsx',
        pattern: '// plop:nav-link',
        templateFile: 'plop-templates/navLink.hbs',
      })
    }

    return actions
  }

  /**
   * Creates the feature's contract in @libs/types (or reuses an existing one),
   * registers it in the package index, and adds a Request/Response pair for
   * each selected mutation. Throws before anything is written if the setup is
   * incomplete.
   */
  const buildContractActions = (answers) => {
    const problems = contractSetupProblems(answers.name, answers.mutations.length > 0)
    if (problems.length > 0) {
      throw new Error(
        `Nothing was changed. Shared contract not possible: ${problems.join('; ')}. Fix it, or answer "no" to the shared contract question.`,
      )
    }
    return [
      {
        type: 'add',
        path: `${LIBS_TYPES}/src/{{name}}/{{name}}.types.ts`,
        templateFile: 'plop-templates/contract.hbs',
        skipIfExists: true,
      },
      {
        type: 'append',
        path: CONTRACT_INDEX,
        pattern: CONTRACT_EXPORT_ANCHOR,
        templateFile: 'plop-templates/contractExport.hbs',
        skip: (data) =>
          readIfExists(CONTRACT_INDEX)?.includes(`'./${data.name}/${data.name}.types.js'`)
            ? 'Skipped: the contract is already registered'
            : undefined,
      },
      // Each append lands directly below the anchor, so add them in reverse
      // to keep the contract in create, update, delete order.
      ...[...answers.mutations].reverse().map(contractMutationAction),
    ]
  }

  // Generator for creating a new feature slice
  plop.setGenerator('feature', {
    description: 'Scaffold a new feature slice',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Feature name (lowercase, e.g. "orders"):',
      },
      {
        type: 'confirm',
        name: 'needsStore',
        message: 'Does this feature need client/UI state (Zustand store)?',
        default: false,
      },
      {
        type: 'checkbox',
        name: 'mutations',
        message: 'Which mutations does this feature need?',
        choices: ['create', 'update', 'delete'],
      },
      {
        type: 'confirm',
        name: 'sharedContract',
        message:
          'Create (or reuse) the shared API contract in @libs/types? Say no only if this feature has no API.',
        default: true,
      },
      ...navLinkPrompts,
    ],
    actions: (answers) => [
      ...(answers.sharedContract ? buildContractActions(answers) : []),
      {
        type: 'add',
        path: 'src/features/{{name}}/types/{{name}}.ts',
        templateFile: 'plop-templates/types.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/types/index.ts',
        templateFile: 'plop-templates/types-index.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/api/{{name}}Api.ts',
        templateFile: 'plop-templates/api.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/api/{{name}}Api.handlers.ts',
        templateFile: 'plop-templates/handlers.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/hooks/queryKeys.ts',
        templateFile: 'plop-templates/queryKeys.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/hooks/use{{pascalCase name}}.ts',
        templateFile: 'plop-templates/useFeature.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/components/{{pascalCase name}}List.tsx',
        templateFile: 'plop-templates/list.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/pages/{{pascalCase name}}Page.tsx',
        templateFile: 'plop-templates/page.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/hooks/useCreate{{pascalCase name}}.ts',
        templateFile: 'plop-templates/mutation.hbs',
        data: { mutationName: 'create' },
        skip: (answers) =>
          answers.mutations.includes('create') ? undefined : 'Skipped: create not selected',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/hooks/useUpdate{{pascalCase name}}.ts',
        templateFile: 'plop-templates/mutation.hbs',
        data: { mutationName: 'update' },
        skip: (answers) =>
          answers.mutations.includes('update') ? undefined : 'Skipped: update not selected',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/hooks/useDelete{{pascalCase name}}.ts',
        templateFile: 'plop-templates/mutation.hbs',
        data: { mutationName: 'delete' },
        skip: (answers) =>
          answers.mutations.includes('delete') ? undefined : 'Skipped: delete not selected',
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/store/use{{pascalCase name}}UiStore.ts',
        templateFile: 'plop-templates/store.hbs',
        skip: (answers) => (answers.needsStore ? undefined : 'Skipped: no store needed'),
      },
      {
        type: 'add',
        path: 'src/features/{{name}}/index.ts',
        templateFile: 'plop-templates/barrel.hbs',
      },
      {
        type: 'add',
        path: 'src/app/router/routes/{{name}}Route.ts',
        templateFile: 'plop-templates/route.hbs',
      },
      {
        type: 'append',
        path: 'src/app/router/router.ts',
        pattern: '// plop:route-import',
        template: "import { {{camelCase name}}Route } from './routes/{{name}}Route'",
      },
      {
        type: 'append',
        path: 'src/app/router/router.ts',
        pattern: '// plop:route-child',
        template: '  {{camelCase name}}Route,',
      },
      ...buildNavLinkActions(answers),
    ],
  })

  // Generator for creating a new route
  plop.setGenerator('route', {
    description: "Add routing to an existing feature that doesn't have it yet",
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Existing feature name (lowercase, e.g. "orders"):',
        validate: (input) => {
          const featureExists = fs.existsSync(fromHere(`src/features/${input}/index.ts`))
          if (!featureExists) {
            return `No feature found at src/features/${input}/index.ts. Check the name, or use the "feature" generator to create it first.`
          }
          const routeExists = fs.existsSync(fromHere(`src/app/router/routes/${input}Route.ts`))
          if (routeExists) {
            return `src/app/router/routes/${input}Route.ts already exists, so this feature is already routed.`
          }
          return true
        },
      },
      ...navLinkPrompts,
    ],
    actions: (answers) => [
      {
        type: 'add',
        path: 'src/app/router/routes/{{name}}Route.ts',
        templateFile: 'plop-templates/route.hbs',
      },
      {
        type: 'append',
        path: 'src/app/router/router.ts',
        pattern: '// plop:route-import',
        template: "import { {{camelCase name}}Route } from './routes/{{name}}Route'",
      },
      {
        type: 'append',
        path: 'src/app/router/router.ts',
        pattern: '// plop:route-child',
        template: '  {{camelCase name}}Route,',
      },
      ...buildNavLinkActions(answers),
    ],
  })

  // ADR generator
  plop.setGenerator('adr', {
    description: 'Create a new numbered Architecture Decision Record',
    prompts: [
      {
        type: 'input',
        name: 'title',
        message: 'ADR title (e.g. "Use React Hook Form for complex forms"):',
      },
    ],
    actions: [
      (answers) => {
        const adrDir = fromHere('docs/adr')
        if (!fs.existsSync(adrDir)) {
          fs.mkdirSync(adrDir, { recursive: true })
        }
        const files = fs.readdirSync(adrDir).filter((f) => /^\d{4}-/.test(f))
        const numbers = files.map((f) => parseInt(f.slice(0, 4), 10))
        const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1
        answers.number = String(next).padStart(4, '0')
        answers.date = new Date().toISOString().split('T')[0]
        answers.slug = answers.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        return `Next ADR number: ${answers.number}`
      },
      {
        type: 'add',
        path: 'docs/adr/{{number}}-{{slug}}.md',
        templateFile: 'plop-templates/adr.hbs',
      },
    ],
  })

  // Hooks generator
  plop.setGenerator('hook', {
    description: 'Add a single new mutation hook to an existing feature',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Existing feature name (lowercase, e.g. "orders"):',
        validate: (input) => {
          const exists = fs.existsSync(fromHere(`src/features/${input}/index.ts`))
          return exists || `No feature found at src/features/${input}/index.ts.`
        },
      },
      {
        type: 'list',
        name: 'mutationName',
        message: 'Which mutation?',
        choices: ['create', 'update', 'delete'],
      },
    ],
    actions: (answers) => {
      const hookPath = `src/features/${answers.name}/hooks/use${pascalCase(answers.mutationName)}${pascalCase(answers.name)}.ts`
      if (fs.existsSync(fromHere(hookPath))) {
        throw new Error(`${hookPath} already exists.`)
      }

      const apiPath = `src/features/${answers.name}/api/${answers.name}Api.ts`
      const handlersPath = `src/features/${answers.name}/api/${answers.name}Api.handlers.ts`
      const apiAnchor = /  \/\/ plop:mutation\r?\n}/
      const handlersAnchor = /  \/\/ plop:handler\r?\n\]/
      const missing = []
      const apiText = readIfExists(apiPath)
      if (apiText === null || !apiAnchor.test(apiText)) {
        missing.push(`${apiPath} (needs "  // plop:mutation" before its closing brace)`)
      }
      const handlersText = readIfExists(handlersPath)
      if (handlersText === null || !handlersAnchor.test(handlersText)) {
        missing.push(`${handlersPath} (needs "  // plop:handler" before its closing bracket)`)
      }

      answers.sharedContract = apiText !== null && apiText.includes("from '@libs/types'")
      if (answers.sharedContract) {
        const contractPath = contractPathFor(answers.name)
        const contract = readIfExists(contractPath)
        if (contract === null || !contract.includes(CONTRACT_MUTATION_ANCHOR)) {
          missing.push(`${contractPath} (needs "${CONTRACT_MUTATION_ANCHOR}")`)
        }
      }

      if (missing.length > 0) {
        throw new Error(`Nothing was changed. Missing anchor in: ${missing.join('; ')}.`)
      }

      return [
        {
          type: 'add',
          path: 'src/features/{{name}}/hooks/use{{pascalCase mutationName}}{{pascalCase name}}.ts',
          templateFile: 'plop-templates/mutation.hbs',
        },
        {
          type: 'modify',
          path: 'src/features/{{name}}/api/{{name}}Api.ts',
          pattern: apiAnchor,
          templateFile: 'plop-templates/hookApiMethod.hbs',
        },
        {
          type: 'modify',
          path: 'src/features/{{name}}/api/{{name}}Api.handlers.ts',
          pattern: handlersAnchor,
          templateFile: 'plop-templates/hookHandler.hbs',
        },
        ...(answers.sharedContract ? [contractMutationAction(answers.mutationName)] : []),
      ]
    },
  })

  // Component generator
  plop.setGenerator('component', {
    description: 'Scaffold a single component inside an existing feature or in shared/ui',
    prompts: [
      {
        type: 'list',
        name: 'location',
        message: 'Where should this component live?',
        choices: [
          { name: 'Inside an existing feature', value: 'feature' },
          { name: 'shared/ui (generic, reusable across features)', value: 'shared' },
        ],
      },
      {
        type: 'input',
        name: 'featureName',
        message: 'Which feature (lowercase, e.g. "orders"):',
        when: (answers) => answers.location === 'feature',
        validate: (input) => {
          const exists = fs.existsSync(fromHere(`src/features/${input}/index.ts`))
          return exists || `No feature found at src/features/${input}/index.ts.`
        },
      },
      {
        type: 'input',
        name: 'componentName',
        message: 'Component name (PascalCase, e.g. "ConfirmDialog"):',
        validate: (input) =>
          /^[A-Z][a-zA-Z0-9]*$/.test(input) ? true : 'Must be PascalCase, e.g. "ConfirmDialog".',
      },
    ],
    actions: (answers) => {
      const targetDir =
        answers.location === 'feature'
          ? `src/features/${answers.featureName}/components`
          : 'src/shared/ui'
      const filePath = `${targetDir}/${answers.componentName}.tsx`
      if (fs.existsSync(fromHere(filePath))) {
        throw new Error(`${filePath} already exists.`)
      }
      return [
        {
          type: 'add',
          path: filePath,
          templateFile: 'plop-templates/component.hbs',
        },
      ]
    },
  })
}