import type { Meta } from '@storybook/react-vite'

/**
 * Every story's sidebar path, as a closed set.
 *
 * A story's `title` is a path in the Storybook sidebar, not copy, and the lingui
 * rule has to be told so. It used to be told by NAME: the stories block exempted
 * any property or attribute called `title`, which also exempted
 * `<Box title="Delete this application" />` inside a story, a real tooltip
 * rendered by a real component. KN-095.
 *
 * It is told by TYPE now. The rule runs with `useTsTypes`, and skips a literal
 * whose contextual type is a union of string literals, so a meta typed with
 * `StoryMeta` has its title skipped and nothing else does. A JSX `title` is
 * contextually a `string`, so it is checked like every other string. And the
 * union can only ever admit a registered story path: copy is not in it, so copy
 * typed this way is a type error rather than an exemption.
 *
 * Adding a story means adding its title here. That is the same list the
 * story-docs guard already demands a markdown file for, in both languages.
 */
export type StoryTitle =
  | 'App/Shell'
  | 'Core/PreferencesProvider'
  | 'Foundations/Tokens'
  | 'Shared/Checkbox'
  | 'Shared/FilterChip'
  | 'Shared/Input'
  | 'Shared/LanguageSwitch'
  | 'Shared/StatusChip'
  | 'Shared/Tooltip'

/** Storybook's `Meta`, with the title narrowed to a registered story path. */
export type StoryMeta<TComponent> = Meta<TComponent> & { title: StoryTitle }
