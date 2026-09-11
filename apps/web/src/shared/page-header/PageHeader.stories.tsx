import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { semantic } from '../../theme/tokens'
import { Button } from '../button'
import type { StoryMeta } from '../story-docs/story-meta'
import { PageHeader, type PageHeaderProps } from './PageHeader'

const px = (value: string) => Number.parseFloat(value) || 0

// The language switch opens a menu; every other control here does not.
const opensMenu = (button: HTMLElement) => button.ariaHasPopup !== null

// The title and the action's label are copy, drawn in the reader's language
// inside the render; which slots show is what each story is about, so the
// Controls panel is off: a title typed there would be a value the page never
// draws in both languages.
const Drawn = ({ onBack, withAction }: { onBack?: PageHeaderProps['onBack'] | undefined; withAction: boolean }) => {
  const { i18n } = useLingui()
  return (
    <PageHeader
      title={i18n._('My job opportunities')}
      {...(onBack === undefined ? {} : { onBack })}
      {...(withAction ? { action: <Button>{i18n._('Add job opportunity')}</Button> } : {})}
    />
  )
}

const meta = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  args: { title: '', onBack: fn() },
  parameters: { controls: { disable: true } },
} satisfies StoryMeta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// The title is the page's heading, level one, at 20 and 600 in text/primary.
const titleOf = async (canvasElement: HTMLElement) => {
  const heading = within(canvasElement).getByRole('heading', { level: 1 })
  const style = getComputedStyle(heading)
  await expect([px(style.fontSize), Number(style.fontWeight)]).toEqual([20, 600])
  await expect(style.color).toBe(computedColour(heading, semantic['text/primary']))
  return heading
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: () => <Drawn withAction />,
  play: async ({ canvasElement }) => {
    // Node 155:56: the title at the inline start, the primary action at the
    // inline end, and no back arrow.
    const heading = await titleOf(canvasElement)
    const controls = within(canvasElement).getAllByRole('button').filter((button) => !opensMenu(button))
    await expect(controls).toHaveLength(1)
    const [action] = controls
    if (!action) throw new Error('no action rendered')
    await expect(action.getBoundingClientRect().right).toBeLessThan(heading.getBoundingClientRect().left)
  },
}

export const WithBack: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <Drawn onBack={args.onBack} withAction={false} />,
  play: async ({ args, canvasElement }) => {
    // Node 155:72: the back arrow before the title, 20 and 12 from it, in
    // text/secondary, and no action; the control round it a target of 24 each
    // way, KN-206 and KN-320, reaching into the gap rather than moving the
    // arrow.
    const heading = await titleOf(canvasElement)
    const [back] = within(canvasElement).getAllByRole('button').filter((button) => !opensMenu(button))
    if (!back) throw new Error('no back control rendered')
    await expect(back.getAttribute('aria-label')?.length).toBeGreaterThan(0)
    const arrow = back.querySelector('svg')
    if (!arrow) throw new Error('the back control has no arrow')
    const [backBox, arrowBox, titleBox] = [back.getBoundingClientRect(), arrow.getBoundingClientRect(), heading.getBoundingClientRect()]
    await expect([backBox.width, backBox.height]).toEqual([24, 24])
    await expect([arrowBox.width, arrowBox.height]).toEqual([20, 20])
    await expect(Math.round(arrowBox.left - titleBox.right)).toBe(12)
    await expect(getComputedStyle(back.querySelector('svg') ?? back).color).toBe(computedColour(back, semantic['text/secondary']))
    await userEvent.click(back)
    await expect(args.onBack).toHaveBeenCalledTimes(1)
  },
}

export const TitleOnly: Story = {
  globals: { locale: 'fa-IR' },
  render: () => <Drawn withAction={false} />,
  play: async ({ canvasElement }) => {
    // Both slots are optional: with neither, the title stands alone, and only
    // the narrow screen's language switch is a control.
    await titleOf(canvasElement)
    const controls = within(canvasElement).queryAllByRole('button').filter((button) => !opensMenu(button))
    await expect(controls).toHaveLength(0)
  },
}

export const LanguageOnNarrowScreens: Story = {
  globals: { locale: 'fa-IR' },
  render: () => <Drawn withAction />,
  play: async ({ canvasElement }) => {
    // The switch shows below the build's mobile breakpoint, MUI's md, and not
    // above it. The width is set with the runner's own viewport; in the
    // published Storybook, resize the window to see it go.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if ('__STORYBOOK_PREVIEW__' in globalThis) return
      throw new Error('LanguageOnNarrowScreens is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const switchOf = () => within(canvasElement).getByRole('button', { hidden: true, name: (_, element) => element instanceof HTMLElement && opensMenu(element) })
    await browser.page.viewport(390, 844)
    await expect(switchOf()).toBeVisible()
    await browser.page.viewport(1440, 900)
    await expect(switchOf()).not.toBeVisible()
    await browser.page.viewport(414, 896)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  render: (args) => <Drawn onBack={args.onBack} withAction />,
  play: async ({ canvasElement }) => {
    // Left to right: the back arrow at the left, mirrored so it points back.
    const heading = await titleOf(canvasElement)
    const back = within(canvasElement).getAllByRole('button')[0]
    if (!back) throw new Error('no back control rendered')
    await expect(back.getBoundingClientRect().right).toBeLessThan(heading.getBoundingClientRect().left)
    await expect(getComputedStyle(back).transform).not.toBe('none')
  },
}
