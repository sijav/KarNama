import type { CodegenConfig } from '@graphql-codegen/cli'

/**
 * Types generated FROM the API's committed schema.
 *
 * The source is `apps/api/schema.gql`, which is itself generated from the
 * resolvers and checked by the API's build, so the chain runs resolvers ->
 * schema.gql -> these types with a refusal at each step. That is the whole
 * reason for a monorepo: a schema change fails at typecheck rather than at
 * runtime.
 *
 * `codegen:update` writes them. The build runs `codegen:check`, which
 * regenerates into memory and compares, and NEVER writes. A build that
 * regenerates before comparing always passes, which is exactly the defect a
 * roast found in the API's own build one card ago.
 */
const config: CodegenConfig = {
  schema: '../../apps/api/schema.gql',
  generates: {
    'src/generated.ts': {
      plugins: ['typescript'],
      config: {
        // No `any` anywhere in generated output either. The repository bans
        // escape hatches and generated code is code.
        useTypeImports: true,
        enumsAsTypes: true,
        skipTypename: true,
        defaultScalarType: 'unknown',
        immutableTypes: true,
        avoidOptionals: false,
        scalars: {
          // The GraphQL Float that carries uptime is a number, and saying so
          // here beats every consumer widening it back.
          Float: 'number',
          Int: 'number',
          ID: 'string',
        },
      },
    },
  },
  hooks: {
    // Not `prettier --write`: the file is compared byte for byte, so anything
    // that reformats it after generation has to run on both sides or the check
    // reports a difference nobody made.
    afterAllFileWrite: [],
  },
}

export default config
