import { setProjectAnnotations } from '@storybook/react-vite'
import { beforeAll, beforeEach } from 'vitest'
import { commands } from 'vitest/browser'
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

// The flag a story reads to know a test runner is driving it, KN-225. Set here
// because only the Vitest storybook project loads this file; the published
// Storybook never does. Owned by this repository, unlike `__vitest_browser__`,
// the Vitest internal the Checkbox Hover story used to rely on, which an upgrade
// could rename and so turn every run into a silent pass.
Object.assign(globalThis, { __KARNAMA_STORY_TEST__: true })

// Every story starts with the runner's real pointer where it hovers nothing,
// KN-260. The Hover stories move that pointer, as they must, and nothing moved
// it back, so the next story to draw a control under the spot started hovered
// and a resting-state assertion failed or passed by where the mouse had been.
// Once for the whole suite, by the parkPointer command vitest.config.ts gives
// the browser: the pointer goes off the page. Storybook's own reset never runs
// in this repository, TECH-DEBT 19, so this one is not a second.
declare module 'vitest/browser' {
  interface BrowserCommands {
    parkPointer: () => Promise<void>
  }
}
beforeEach(async () => {
  await commands.parkPointer()
})
