import { setupI18n } from '@lingui/core'
import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
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

// The panel opens from a trigger with a field for a body; the story holds
// whether it is open, and can set the delete aside.
const WithTrigger = ({ onClose, withAside = false, ...args }: PanelModalProps & { withAside?: boolean }) => {
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
