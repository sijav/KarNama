import { setupI18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { Button } from '../button'
import { Input } from '../input'
import type { StoryMeta } from '../story-docs/story-meta'
import { PanelModal, type PanelModalProps } from './PanelModal'

// The Contact Modal's title, node 270:152, from the catalog in the language a
// story pins.
const titleIn = (locale: Locale) => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  return i18n._('Edit contact')
}

// Save in the language a story pins, to find it by its name.
const saveIn = (locale: Locale) => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  return i18n._('Save')
}

// The panel opens from a trigger with a field for a body; the story holds
// whether it is open, and can set the delete aside and a body as long as the
// contact modal's.
const WithTrigger = ({ onClose, withAside = false, long = false, ...args }: PanelModalProps & { withAside?: boolean; long?: boolean }) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  const close = () => {
    setOpen(false)
    onClose()
  }
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
      >
        {args.title}
      </Button>
      <PanelModal
        {...args}
        open={open}
        onClose={close}
        actions={
          <>
            <Button variant="ghost" onClick={close}>
              {i18n._('Cancel')}
            </Button>
            <Button onClick={close}>{i18n._('Save')}</Button>
          </>
        }
        {...(withAside
          ? {
              aside: (
                <Button variant="destructive" onClick={close}>
                  {i18n._('Delete contact')}
                </Button>
              ),
            }
          : {})}
      >
        <Input label={i18n._('Full name')} placeholder={i18n._('e.g. Sara Mohammadi')} />
        {long ? (
          <>
            <Input label={i18n._('Role')} />
            <Input label={i18n._('Company')} />
            <Input label={i18n._('Email')} />
            <Input label={i18n._('Phone')} />
            <Input label={i18n._('Social link')} />
            <Input label={i18n._('Related job opportunity')} />
          </>
        ) : null}
      </PanelModal>
    </>
  )
}

const meta = {
  title: 'Shared/PanelModal',
  component: PanelModal,
  args: { open: false, title: titleIn('fa-IR'), width: 560, onClose: fn(), children: null, actions: null },
  parameters: { controls: { include: ['title', 'width'] } },
  render: (args) => <WithTrigger {...args} />,
} satisfies StoryMeta<typeof PanelModal>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

export const Panel: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Node 270:152's frame: the header 24 above and at the sides and 16 below,
    // the dividers edge to edge, the body in 24, the footer in 16 and 24, and
    // the actions at the inline end.
    await userEvent.click(within(canvasElement).getByRole('button'))
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', { name: args.title })
    const [header, top, form, , footer] = [...dialog.children].filter((part) => part instanceof HTMLElement)
    if (!header || !top || !form || !footer) throw new Error('the panel has not five parts')
    const [headerStyle, formStyle, footerStyle] = [header, form, footer].map((part) => getComputedStyle(part))
    await expect(
      [
        headerStyle?.paddingTop,
        headerStyle?.paddingBottom,
        formStyle?.paddingTop,
        footerStyle?.paddingTop,
        footerStyle?.paddingInlineStart,
      ].map((value) => px(value ?? '')),
    ).toEqual([24, 16, 24, 16, 24])
    await expect(top.getBoundingClientRect().width).toBe(args.width)
    await expect(footerStyle?.justifyContent).toBe('flex-end')
    await userEvent.keyboard('{Escape}')
  },
}

export const WithAnAside: Story = {
  globals: { locale: 'fa-IR' },
  render: (args) => <WithTrigger {...args} withAside />,
  play: async ({ canvasElement }) => {
    // Mode=Edit's footer: the actions at the inline start, the delete at the end.
    await userEvent.click(within(canvasElement).getByRole('button'))
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog')
    const footer = [...dialog.children].filter((part) => part instanceof HTMLElement).at(-1)
    if (!footer) throw new Error('no footer')
    // Spaced between: the actions at one end, the aside at the other.
    await expect(getComputedStyle(footer).justifyContent.endsWith('between')).toBe(true)
    await userEvent.keyboard('{Escape}')
  },
}

// KN-349: a phone 844 tall, the view its software keyboard of about 300 leaves, and
// that keyboard grown and the page scrolled under it.
const PHONE = { width: 390, height: 844 }
const ABOVE_THE_KEYBOARD = 544
const GROWN = 500
const SCROLLED = 40

// The Dialog root that holds the panel, through MUI's container: where the panel is placed.
const rootOf = (dialog: HTMLElement) => {
  const root = dialog.parentElement?.parentElement
  if (!root || getComputedStyle(root).position !== 'fixed') throw new Error('the panel is not in a fixed root')
  return root
}

// Opens the long panel, focuses its last field, and finds that field and Save between the top
// and the bottom given.
const footerInView = async (canvasElement: HTMLElement, top: number, bottom: number) => {
  await userEvent.click(within(canvasElement).getByRole('button'))
  const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog')
  await waitFor(() => expect(dialog).toBeVisible())
  const last = within(dialog).getAllByRole('textbox').at(-1)
  if (!last) throw new Error('the panel has no field')
  last.focus()
  await expect(last).toHaveFocus()
  const save = within(dialog).getByRole('button', { name: saveIn('fa-IR') })
  for (const element of [last, save]) {
    const box = element.getBoundingClientRect()
    await expect(box.top).toBeGreaterThanOrEqual(top)
    await expect(box.bottom).toBeLessThanOrEqual(bottom)
  }
  return dialog
}

// The property a story stands in and the events it sends, typed so the lint rule reads each as a
// name rather than as copy.
type ViewportProperty = 'visualViewport'
const VISUAL_VIEWPORT: ViewportProperty = 'visualViewport'
const RESIZE: keyof VisualViewportEventMap = 'resize'
const SCROLL: keyof VisualViewportEventMap = 'scroll'

// The visual viewport stood in for, KN-349, as a phone keyboard shrinks it over a page it leaves
// alone: the window's own property, configurable in Chromium. What it returns puts it back.
const standIn = (seen: EventTarget | null) => {
  const original = Object.getOwnPropertyDescriptor(window, VISUAL_VIEWPORT)
  Object.defineProperty(window, VISUAL_VIEWPORT, { configurable: true, get: () => seen })
  return () => {
    if (original) Object.defineProperty(window, VISUAL_VIEWPORT, original)
  }
}
const seen = Object.assign(new EventTarget(), { height: ABOVE_THE_KEYBOARD, offsetTop: 0 })
// The stand-in as a keyboard first leaves it, for each run of the story.
const atTheKeyboard = () => Object.assign(seen, { height: ABOVE_THE_KEYBOARD, offsetTop: 0 })

export const FooterInAPhoneView: Story = {
  globals: { locale: 'fa-IR' },
  // A fixed phone and a fixed form, so no control applies.
  parameters: { controls: { disable: true } },
  render: (args) => <WithTrigger {...args} long />,
  play: async ({ canvasElement }) => {
    // The card's own view, KN-349: at 390 by 544 a form as long as the contact modal's keeps
    // its last field and Save in view. The view itself is small here, which a keyboard does not
    // make it, so FooterAboveTheKeyboard is the keyboard's story. The runner's own browser
    // resizes the screen, KN-225, and the story puts it back.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(PHONE.width, ABOVE_THE_KEYBOARD)
      await footerInView(canvasElement, 0, ABOVE_THE_KEYBOARD)
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const FooterAboveTheKeyboard: Story = {
  globals: { locale: 'fa-IR' },
  parameters: { controls: { disable: true } },
  // Stood in before the story renders, so the panel reads the stand-in from its first render,
  // and only under the runner, so a Docs page drawing this story keeps the real viewport.
  beforeEach: () => ('__KARNAMA_STORY_TEST__' in globalThis ? standIn(atTheKeyboard()) : undefined),
  render: (args) => <WithTrigger {...args} long />,
  play: async ({ canvasElement }) => {
    // KN-349: a phone 844 tall whose keyboard leaves 544 in view. The page is not resized, as a
    // keyboard does not resize it in Safari on iOS or Chrome on Android; the visual viewport is
    // stood in for, and the panel sits inside it, its root on the viewport and the last field
    // and Save above the keyboard. Then the keyboard grows and the page scrolls under it, and
    // the root follows both. No real keyboard runs here.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(PHONE.width, PHONE.height)
      const dialog = await footerInView(canvasElement, 0, ABOVE_THE_KEYBOARD)
      const root = rootOf(dialog)
      await expect([root.getBoundingClientRect().top, root.getBoundingClientRect().height]).toEqual([0, ABOVE_THE_KEYBOARD])
      seen.height = GROWN
      seen.dispatchEvent(new Event(RESIZE))
      await waitFor(async () => {
        await expect(root.getBoundingClientRect().height).toBe(GROWN)
      })
      seen.offsetTop = SCROLLED
      seen.dispatchEvent(new Event(SCROLL))
      await waitFor(async () => {
        await expect(root.getBoundingClientRect().top).toBe(SCROLLED)
      })
      const save = within(dialog).getByRole('button', { name: saveIn('fa-IR') })
      await expect(save.getBoundingClientRect().bottom).toBeLessThanOrEqual(SCROLLED + GROWN)
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

export const WithoutAVisualViewport: Story = {
  globals: { locale: 'fa-IR' },
  parameters: { controls: { disable: true } },
  // Only under the runner, as above.
  beforeEach: () => ('__KARNAMA_STORY_TEST__' in globalThis ? standIn(null) : undefined),
  play: async ({ canvasElement }) => {
    // KN-349: a browser with no visual viewport keeps the root where MUI puts it, over the window.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    await userEvent.click(within(canvasElement).getByRole('button'))
    const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog')
    const root = rootOf(dialog)
    await expect([root.getBoundingClientRect().top, root.getBoundingClientRect().height]).toEqual([0, window.innerHeight])
    await userEvent.keyboard('{Escape}')
  },
}
