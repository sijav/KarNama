import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { semantic } from '../../theme/tokens'
import { HOLD_MS, SLOP } from '../hold'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { ContactCard, type ContactCardContact, type ContactCardProps } from './ContactCard'

// A contact from the story fixtures, as the page would hand it over: the job it
// is linked to written «company — title», as node 248:116 writes it.
const contactIn = (locale: Locale, index: number): ContactCardContact => {
  const set = fixtures(locale)
  const contact = set.contacts[index]
  if (!contact) throw new Error(`the story fixtures have no contact ${String(index)}`)
  const job = set.jobs.find((entry) => entry.id === contact.jobId)
  return {
    name: contact.fullName,
    role: contact.role,
    company: contact.company,
    email: contact.email,
    phone: contact.phone,
    job: job === undefined ? null : `${job.company} — ${job.title}`,
    linkedin: contact.linkedin,
  }
}

// A contact with only a name, which the owner allowed, KN-071: the first
// fixture's name, and no role, company or field.
const nameOnlyIn = (locale: Locale): ContactCardContact => ({
  ...contactIn(locale, 0),
  role: null,
  company: null,
  email: null,
  phone: null,
  job: null,
  linkedin: null,
})

const CONTROLLED: (keyof ContactCardProps)[] = ['contact', 'layout', 'selected', 'phone', 'selecting']
const LAYOUTS: NonNullable<ContactCardProps['layout']>[] = ['full', 'compact']

// The file's full card is 360 wide and its compact one 560; the card fills its
// container, so the stories give it the file's width.
const WIDTHS = { full: 360, compact: 560 } as const

const meta = {
  title: 'Shared/ContactCard',
  component: ContactCard,
  args: { contact: contactIn('fa-IR', 0), layout: 'full', selected: false, onOpen: fn(), onSelectedChange: fn(), onDelete: fn() },
  argTypes: { layout: { control: 'radio', options: LAYOUTS } },
  parameters: { controls: { include: CONTROLLED } },
  decorators: [
    (Story, { args }) => (
      <Box sx={{ width: WIDTHS[args.layout ?? 'full'] }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof ContactCard>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

const cardOf = (canvasElement: HTMLElement) => {
  const card = canvasElement.querySelector('article')
  if (!card) throw new Error('no card')
  return card
}

// The card's own button is the one named by the contact's name.
const openerOf = (canvasElement: HTMLElement, name: string) => within(canvasElement).getByRole('button', { name })

// Whether the checkbox is seen: its root's, since the native input the role
// sits on is always transparent under the drawn frame.
const seen = (checkbox: HTMLElement) => checkbox.parentElement?.checkVisibility({ opacityProperty: true }) ?? false

// The full card's delete, named in either language.
const deleteOf = (card: HTMLElement) => within(card).getByRole('button', { name: /حذف|Delete/u })

// How far the name starts from the card's inline start, inside its padding: from
// the right, in Persian.
const nameInset = (card: HTMLElement, name: HTMLElement) =>
  Math.round(card.getBoundingClientRect().right - px(getComputedStyle(card).paddingRight) - name.getBoundingClientRect().right)

// What a finger does to a phone's card, dispatched as the browser would, the job
// card's, KN-428: a press, a drift, a lift, the browser taking the touch for a
// scroll. These prove the card's own handlers, not a phone's gesture recognition.
type Pointing = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel'
type Finger = 'touch'
const FINGER: Finger = 'touch'
type Mouse = 'mouse'
const MOUSE: Mouse = 'mouse'
const pointer = (target: Element, type: Pointing, init: PointerEventInit = {}) => {
  const box = target.getBoundingClientRect()
  return target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      isPrimary: true,
      pointerId: 1,
      pointerType: FINGER,
      button: 0,
      clientX: box.left + box.width / 2,
      clientY: box.top + box.height / 2,
      ...init,
    }),
  )
}
// The click a release sends, with a detail of 1, or a key, with 0.
type Clicking = 'click'
const CLICK: Clicking = 'click'
const clickOn = (target: Element, detail: number) =>
  target.dispatchEvent(new MouseEvent(CLICK, { bubbles: true, cancelable: true, detail }))
// A contextmenu, as a phone's browser may send for its own long press: true when
// nothing prevented it.
type Menuing = 'contextmenu'
const CONTEXT: Menuing = 'contextmenu'
const contextOn = (target: Element) => target.dispatchEvent(new MouseEvent(CONTEXT, { bubbles: true, cancelable: true }))
// A wait of the hold's own length, begun after the card's timer: timers of one
// delay run in the order they were set, so when it ends the card's hold would
// already have run, and a check that nothing was chosen is not a guess.
const pastTheHold = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, HOLD_MS)
  })

export const Full: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 248:54: 24 of padding, 12 between its rows, radius lg, one pixel of
    // border/default; the name at 16 and 600, the role line in text/secondary,
    // a divider, then email, phone, the linked job and LinkedIn, each with its
    // icon; the checkbox and delete folded out of the row at rest, unseen but
    // still in the keyboard's path, KN-341.
    const card = cardOf(canvasElement)
    const style = getComputedStyle(card)
    await expect([
      px(style.paddingTop),
      px(style.rowGap),
      px(style.borderTopLeftRadius),
      px(getComputedStyle(card, '::before').borderTopWidth),
    ]).toEqual([24, 12, 16, 1])
    await expect(style.backgroundColor).toBe(computedColour(card, semantic['bg/surface']))
    const name = openerOf(canvasElement, args.contact.name)
    await expect([px(getComputedStyle(name).fontSize), Number(getComputedStyle(name).fontWeight)]).toEqual([16, 600])
    // The name, a button, in the page's face, not the browser's button font,
    // KN-351.
    await expect(getComputedStyle(name).fontFamily).toBe(getComputedStyle(card).fontFamily)
    await expect(seen(within(card).getByRole('checkbox'))).toBe(false)
    await expect(deleteOf(card).getBoundingClientRect().width).toBe(0)
    // Email and phone are links that act: mailto and tel.
    const [email, phone, linkedin] = within(card).getAllByRole('link')
    await expect([email?.getAttribute('href'), phone?.getAttribute('href')]).toEqual([
      `mailto:${args.contact.email ?? ''}`,
      `tel:${args.contact.phone ?? ''}`,
    ])
    // LinkedIn opens in a new tab.
    await expect([linkedin?.getAttribute('href')?.endsWith(args.contact.linkedin ?? 'missing'), linkedin?.getAttribute('target')]).toEqual([
      true,
      '_blank',
    ])
    await expect(card).toHaveTextContent(args.contact.job ?? 'missing')
    // Pressing the card anywhere else opens the contact.
    await userEvent.click(name)
    await expect(args.onOpen).toHaveBeenCalledTimes(1)
  },
}

export const FullHover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 248:84: one and a half of border/focus, the delete at the inline end
    // and the checkbox before the name, which moves over by it; the row stays
    // 30. The browser's own pointer, which only the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const card = cardOf(canvasElement)
    const name = openerOf(canvasElement, args.contact.name)
    const before = name.getBoundingClientRect()
    await browser.userEvent.hover(card)
    const checkbox = await within(card).findByRole('checkbox')
    // The delete joins the name as the card's second button.
    await expect(within(card).getAllByRole('button')).toHaveLength(2)
    await waitFor(() => expect(getComputedStyle(card).boxShadow.endsWith('inset')).toBe(true))
    const after = name.getBoundingClientRect()
    await expect(Math.round(Math.abs(after.right - before.right))).toBe(28)
    await expect(name.parentElement?.parentElement?.getBoundingClientRect().height).toBe(30)
    await userEvent.click(checkbox)
    await expect(args.onSelectedChange).toHaveBeenCalledWith(true)
  },
}

export const FullTabOrder: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Tab from before the card meets its controls in the order they are
    // drawn, KN-341: the checkbox, folded at rest and unfolding as it takes
    // focus, then the name, then the delete; the row keeps its 30 and the name
    // has moved over by 28. The browser's own Tab, which only the runner has,
    // KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const card = cardOf(canvasElement)
    const name = openerOf(canvasElement, args.contact.name)
    const before = name.getBoundingClientRect()
    const checkbox = within(card).getByRole('checkbox')
    // Focus starts just before the card.
    canvasElement.tabIndex = -1
    canvasElement.focus()
    for (const control of [checkbox, name, deleteOf(card)]) {
      await browser.userEvent.tab()
      await expect(control).toHaveFocus()
    }
    canvasElement.removeAttribute('tabindex')
    await expect(seen(checkbox)).toBe(true)
    await expect(Math.round(Math.abs(name.getBoundingClientRect().right - before.right))).toBe(28)
    await expect(name.parentElement?.parentElement?.getBoundingClientRect().height).toBe(30)
  },
}

export const FullSelected: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 248:115: bg/brand/container and the edge of border/focus, the
    // checkbox checked and the delete in view.
    const card = cardOf(canvasElement)
    await expect(getComputedStyle(card).backgroundColor).toBe(computedColour(card, semantic['bg/brand/container']))
    // Named for whoever it selects, on the input the role belongs to, KN-423.
    await expect(within(card).getByRole('checkbox', { name: `${i18nFor('fa-IR')._('Select')} ${args.contact.name}` })).toBeChecked()
    await userEvent.click(deleteOf(card))
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

export const FullOnAPhone: Story = {
  args: { phone: true },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // A press held on a phone's card chooses the person, the network's cards
    // pressing to Mobile Selection, 252:411 to 305:1842, KN-533, and the click its
    // release sends opens nothing. At rest it is the desktop's card, the checkbox
    // folded and the name at the inline start, and a hold starts no text
    // selection.
    const card = cardOf(canvasElement)
    const name = openerOf(canvasElement, args.contact.name)
    await expect(seen(within(card).getByRole('checkbox'))).toBe(false)
    await expect(nameInset(card, name)).toBe(0)
    await expect(getComputedStyle(card).userSelect).toBe('none')
    // Waited for with room past the hold's own half second, which a loaded
    // runner can stretch; the wait ends as soon as the call arrives.
    pointer(name, 'pointerdown')
    await waitFor(() => expect(args.onSelectedChange).toHaveBeenCalledTimes(1), { timeout: HOLD_MS * 4 })
    await expect(args.onSelectedChange).toHaveBeenLastCalledWith(true)
    pointer(name, 'pointerup')
    clickOn(name, 1)
    await expect(args.onOpen).not.toHaveBeenCalled()

    // A hold whose release sends no click, as a phone may after a long press,
    // leaves the tap after it to open the contact.
    pointer(name, 'pointerdown')
    await waitFor(() => expect(args.onSelectedChange).toHaveBeenCalledTimes(2), { timeout: HOLD_MS * 4 })
    pointer(name, 'pointerup')
    pointer(name, 'pointerdown')
    pointer(name, 'pointerup')
    clickOn(name, 1)
    await expect(args.onOpen).toHaveBeenCalledTimes(1)

    // A contextmenu during a press, which a phone's browser may send for its own
    // long press, is that hold arriving first: it chooses at once and shows no
    // menu, and one just after the hold shows none either.
    pointer(name, 'pointerdown')
    await expect(contextOn(name)).toBe(false)
    await expect(args.onSelectedChange).toHaveBeenCalledTimes(3)
    await expect(contextOn(name)).toBe(false)
    pointer(name, 'pointerup')

    // After a hold the keyboard's Enter still opens the contact: the click it
    // sends carries a detail of 0. The runner's own key, KN-225; elsewhere that
    // click.
    const browser = '__KARNAMA_STORY_TEST__' in globalThis ? await import('vitest/browser') : null
    name.focus()
    if (browser) {
      await browser.userEvent.keyboard('{Enter}')
    } else {
      clickOn(name, 0)
    }
    await expect(args.onOpen).toHaveBeenCalledTimes(2)
    name.blur()

    // And the phone's card has no hover, which a tap would leave behind: the
    // runner's pointer over it lifts no edge and unfolds nothing, where the
    // desktop's lifts both, FullHover.
    if (!browser) return
    await browser.userEvent.hover(card)
    await waitFor(() => expect(card.matches(':hover')).toBe(true))
    await expect(getComputedStyle(card).boxShadow).toBe('none')
    await expect(seen(within(card).getByRole('checkbox'))).toBe(false)
  },
}

export const FullNotAHoldOnAPhone: Story = {
  args: { phone: true },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // What does not choose a person on a phone, KN-533. Each check waits the
    // hold's own length, begun after the card's timer, so the card's hold would
    // have run by the time it looks. A finger leaving the card is not among them:
    // a touch browser captures the pointer on its press, so that seldom arrives,
    // KN-533's plan review.
    const card = cardOf(canvasElement)
    const name = openerOf(canvasElement, args.contact.name)
    const box = name.getBoundingClientRect()

    // A tap, which opens the contact.
    pointer(name, 'pointerdown')
    const tapped = pastTheHold()
    pointer(name, 'pointerup')
    clickOn(name, 1)
    await tapped
    await expect(args.onOpen).toHaveBeenCalledTimes(1)

    // A press that drifts further than the slop, a scroll beginning, and the
    // moves after it.
    pointer(name, 'pointerdown')
    const drifted = pastTheHold()
    pointer(name, 'pointermove', { clientX: box.left + box.width / 2 + SLOP + 1 })
    pointer(name, 'pointermove', { clientX: box.left + box.width / 2 + 2 * SLOP })
    await drifted
    pointer(name, 'pointerup')

    // One the browser takes over for a scroll.
    pointer(name, 'pointerdown')
    const cancelled = pastTheHold()
    pointer(name, 'pointercancel')
    await cancelled

    // A second finger, and a right click, whose menu is the browser's to show.
    pointer(name, 'pointerdown', { isPrimary: false, pointerId: 2 })
    await pastTheHold()
    pointer(name, 'pointerdown', { button: 2, pointerType: MOUSE })
    const right = pastTheHold()
    await expect(contextOn(name)).toBe(true)
    await right

    // A press on the checkbox, the delete or a link, each its own control. The
    // checkbox and delete are folded at rest, and pressed here as they are while
    // the page is choosing or the keyboard is inside the card.
    const [link] = within(card).getAllByRole('link')
    if (!link) throw new Error('the card has no link')
    for (const control of [within(card).getByRole('checkbox'), deleteOf(card), link]) {
      pointer(control, 'pointerdown')
      await pastTheHold()
      pointer(control, 'pointerup')
    }

    await expect(args.onSelectedChange).not.toHaveBeenCalled()
    await expect(args.onOpen).toHaveBeenCalledTimes(1)
  },
}

export const FullSelectingOnAPhone: Story = {
  args: { phone: true, selecting: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // While anyone on the page is chosen, every phone card shows its checkbox, as
    // the Checkbox 204:11 says: unchecked on a person not chosen, before the name,
    // which moves over by 28 as the hover's does, over the press's 250 ms, KN-533.
    // The delete stays folded, and a tap on the checkbox chooses the person.
    const card = cardOf(canvasElement)
    const name = openerOf(canvasElement, args.contact.name)
    const checkbox = within(card).getByRole('checkbox', { name: `${i18nFor('fa-IR')._('Select')} ${args.contact.name}` })
    await expect(seen(checkbox)).toBe(true)
    await expect(checkbox).not.toBeChecked()
    await expect(nameInset(card, name)).toBe(28)
    await expect(deleteOf(card).getBoundingClientRect().width).toBe(0)
    const fold = checkbox.closest('.KarnamaContactCard-check')
    if (!fold) throw new Error('the checkbox has no fold round it')
    await expect(getComputedStyle(fold).transitionDuration.split(', ')).toEqual(['0.25s', '0.25s'])
    await userEvent.click(checkbox)
    await expect(args.onSelectedChange).toHaveBeenCalledWith(true)
    await expect(args.onOpen).not.toHaveBeenCalled()
  },
}

export const CheckboxRingIsWhole: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // The Title Group's host contract, KN-293: the checkbox, focused by the
    // keyboard where the file draws it, flush at the group's inline start and
    // 8 from the name, and every ancestor that clips holds its whole 28 by 28
    // root, the ring's room included. From the name, which brings it into
    // the row, Shift+Tab reaches it, whatever had focus before the story.
    const card = cardOf(canvasElement)
    openerOf(canvasElement, args.contact.name).focus()
    await userEvent.tab({ shift: true })
    const checkbox = within(card).getByRole('checkbox')
    await expect(checkbox).toHaveFocus()
    const root = checkbox.parentElement
    if (!root) throw new Error('the checkbox has no root')
    const ring = root.getBoundingClientRect()
    await expect([Math.round(ring.width), Math.round(ring.height)]).toEqual([28, 28])
    for (let node = root.parentElement; node && node !== canvasElement; node = node.parentElement) {
      const clip = getComputedStyle(node)
      if (clip.overflowX === 'visible' && clip.overflowY === 'visible') continue
      const box = node.getBoundingClientRect()
      await expect(ring.left >= box.left && ring.right <= box.right && ring.top >= box.top && ring.bottom <= box.bottom).toBe(true)
    }
  },
}

export const LongValues: Story = {
  args: { contact: contactIn('fa-IR', 1) },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // A long name, role and email are cut with an ellipsis on one line; the
    // card keeps its width and every row its height.
    const card = cardOf(canvasElement)
    await expect(Math.round(card.getBoundingClientRect().width)).toBe(360)
    for (const element of [...card.querySelectorAll('*')]) {
      if (!(element instanceof HTMLElement) || getComputedStyle(element).textOverflow !== 'ellipsis') continue
      await expect(element.scrollWidth).toBeGreaterThanOrEqual(element.clientWidth)
      await expect(element.getBoundingClientRect().height).toBeLessThanOrEqual(24)
    }
  },
}

export const Compact: Story = {
  args: { layout: 'compact' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 463:684: 12 of padding and gap, radius md, the 40 avatar in
    // bg/brand/container, the name at 14 and 500 over the role at 12, and the
    // mail and delete Icon Buttons at the inline end.
    const card = cardOf(canvasElement)
    const style = getComputedStyle(card)
    await expect([px(style.paddingTop), px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([12, 12, 8])
    const name = openerOf(canvasElement, args.contact.name)
    await expect([px(getComputedStyle(name).fontSize), Number(getComputedStyle(name).fontWeight)]).toEqual([14, 500])
    // Mail is a LINK, since it goes to an address, and delete is the one
    // button beside the name.
    await expect(within(card).getAllByRole('link')).toHaveLength(1)
    const buttons = within(card)
      .getAllByRole('button')
      .filter((button) => button !== name)
    await expect(buttons).toHaveLength(1)
    await userEvent.click(buttons.at(-1) ?? card)
    await expect(args.onDelete).toHaveBeenCalledTimes(1)
  },
}

export const CompactSelected: Story = {
  args: { layout: 'compact', selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const card = cardOf(canvasElement)
    await expect(getComputedStyle(card).backgroundColor).toBe(computedColour(card, semantic['bg/brand/container']))
  },
}

export const WithoutEmailOrPhone: Story = {
  args: { contact: contactIn('fa-IR', 2) },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // A contact with no email, phone, job or LinkedIn, which the owner allowed,
    // KN-071: the card draws no empty rows.
    await expect(within(cardOf(canvasElement)).queryAllByRole('link')).toHaveLength(0)
  },
}

export const InEnglish: Story = {
  args: { contact: contactIn('en-US', 0) },
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    await expect(openerOf(canvasElement, args.contact.name)).toBeVisible()
    // Its checkbox named in English too, folded at rest, KN-423.
    const i18n = i18nFor('en-US')
    const name = `${i18n._('Select')} ${args.contact.name}`
    await expect(within(cardOf(canvasElement)).getByRole('checkbox', { name })).not.toBeChecked()
  },
}

export const NameOnly: Story = {
  args: { contact: nameOnlyIn('fa-IR') },
  play: async ({ args, canvasElement }) => {
    // A contact with only a name, KN-342: the title row alone inside the
    // card's 24 of padding, with no empty role line and no divider under it.
    const card = cardOf(canvasElement)
    await expect(openerOf(canvasElement, args.contact.name)).toBeInTheDocument()
    await expect(card.querySelector('p, hr')).toBeNull()
    await expect(card.getBoundingClientRect().height).toBe(24 + 30 + 24)
  },
}

export const NameOnlyCompact: Story = {
  args: { contact: nameOnlyIn('fa-IR'), layout: 'compact' },
  play: async ({ args, canvasElement }) => {
    // The compact card with only a name: the name stands alone beside the
    // avatar, with no empty role line under it.
    const name = openerOf(canvasElement, args.contact.name)
    await expect(name.parentElement?.children).toHaveLength(1)
  },
}

export const WritingToThem: Story = {
  args: { layout: 'compact' },
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // The compact card's mail control is a LINK to the address, as the full
    // card's own email row is: it can be opened where the reader reads mail,
    // or copied, and a screen reader says link rather than button.
    const mail = within(cardOf(canvasElement)).getByRole('link', { name: 'ارسال ایمیل' })
    await expect(mail).toHaveAttribute('href', `mailto:${args.contact.email ?? ''}`)
  },
}
