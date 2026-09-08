1. **Types-only coverage:** acceptable. There is no runtime code to cover. Coverage must not be used as a proxy for codegen validity. The meaningful checks are: fresh-generation staleness comparison, typechecking consumers, and a compile fixture covering nullability and scalar mappings. The current `handwritten.test.ts` tests the scanner, not type compatibility.

2. **Fresh output can differ without a schema change** through generator/plugin/transitive dependency upgrades, codegen configuration changes, hooks/formatters, Node/platform-dependent generator behavior, nondeterministic plugin output, a generated timestamp or absolute/temp path, and CRLF versus LF. The current check does not leak its temporary path into this simple output, and object-key order has no effect here. Plugin-list order, output-map order with multiple outputs, or glob-loaded schema/document ordering would matter if introduced.

3. **Current `HealthQueryData = Pick<Query, 'health'>` behavior:**
   - Renamed or removed `Query.health`: fails at `Pick`.
   - Renamed or removed selected nested fields: fails only because `toHealthState` currently reads all three fields.
   - Made nullable: fails for `environment` and `uptimeSeconds`; `status` also fails because the degraded branch would return `string | null` where `string` is required.
   - `Float` to `String`: fails because `uptimeSeconds` is returned as a `number`.
   
   None of those four silently pass for the three currently consumed fields. But the query document itself is not checked: a misspelled selected field silently typechecks.

4. **Runtime gaps:** schema-valid types do not prove the deployed endpoint is the same version, the endpoint URL/auth/CORS is correct, Apollo serializes/parses values correctly, resolver implementations honor non-null/scalar contracts, query validation succeeds, partial GraphQL errors are handled, or caching/network behavior is correct.

Findings:

- **critical** — The GraphQL operation is manually asserted as a `TypedDocumentNode`; it is not generated from or validated against the schema. Change `environment` in the query to `environmentTypo`: TypeScript still accepts the asserted `HealthQueryData`, and the test still passes because `environmentTypo` contains the expected substring. The server rejects the request at runtime. This defeats the stated “fail at typecheck rather than at runtime” guarantee. `apps/web/src/core/api/health.ts:18-26`, `apps/web/src/core/api/health.test.ts:16-19`. The installed `typescript-operations` plugin is unused.

- **major** — `HealthQueryData` lies about the response shape. It claims `health` is the entire generated `Health`, not the three-field selection. Add a required `buildId` field to `Health`, regenerate, and the declared response type says Apollo returned `buildId`; `HEALTH_QUERY` does not request it. This is exactly why operation-level generation exists. `apps/web/src/core/api/health.ts:16-26`.

- **major** — The “no handwritten duplicate” test does not prove its claim. It only finds top-level `export type|interface` declarations with exactly a generated type’s name. A local `interface LocalHealth { status: string; environment: string; uptimeSeconds: number }`, or an unexported `interface Health`, is invisible and can replace generated data types in a web module. `packages/graphql/src/handwritten.test.ts:50-58`.

- **major** — The added fallback reason is user-facing English copy outside Lingui, despite the comment claiming user-facing text must not originate here. Persian users will receive English whenever the API returns no data and no error. `apps/web/src/core/api/health.ts:53`.

I ran the board validator and the web TypeScript check, both passed. I could not run KN-035’s verifier in this read-only review sandbox because it deliberately edits source/schema/generated files.

VERDICT
score: 4.0
criticals: 1
one-line: Generate and consume typed operations, not a manually asserted TypedDocumentNode over broad schema types.