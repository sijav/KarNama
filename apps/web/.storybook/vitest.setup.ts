import { setProjectAnnotations } from '@storybook/react-vite'
import { beforeAll } from 'vitest'
import preview from './preview'

// Storybook 10.5.10 prints an Info notice saying this call is applied
// automatically and can safely be removed. In this configuration that is FALSE,
// and it was tested rather than believed: removing it fails seven tests, because
// every story then renders with no theme, no direction and no catalog, so the
// English shell renders Persian and the token stories lose their providers.
//
// A story that renders without the preview's decorators is the shape of test
// that reports green while checking a component nobody ships, so the notice is
// worth ignoring until a Storybook release makes it true. Delete this only
// after running the suite without it and seeing 63 tests pass.
const project = setProjectAnnotations([preview])

beforeAll(project.beforeAll)
