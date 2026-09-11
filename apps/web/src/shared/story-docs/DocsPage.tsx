import { Controls, Markdown, Primary, Stories, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks'
import { storyDocFor } from './catalog'
import { useDocsLocale } from './useDocsLocale'

/**
 * The Docs page for every story, in whichever language the toolbar is set to.
 *
 * **What is localized and what is not.** The prose this repository owns — the
 * component description, each prop, each story — comes from
 * `story-docs/<lang>/` and follows the toolbar. Storybook's own chrome, the
 * Controls table headings and "Show code", stays English: Storybook does not
 * localize it and no parameter makes it. That boundary is stated here rather
 * than left for a reader to discover, because "the Docs page reads fully in
 * Persian" is this card's exit condition and this is exactly how far it goes.
 *
 * **Why the prop and story prose is rendered here** rather than handed to
 * `Controls` and `Stories`: those blocks read Storybook's own prepared
 * `argTypes` and story descriptions, which are fixed when the story is loaded.
 * A page component cannot retroactively push a language-specific description
 * into them, so the localized prose is rendered as its own section and the
 * blocks keep doing what they do, which is types, defaults and canvases.
 */
export const DocsPage = () => {
  const locale = useDocsLocale()
  const resolved = useOf('meta', ['meta'])
  const title = resolved.preparedMeta.title
  const doc = storyDocFor(title, locale)

  return (
    <>
      <Title />
      <Subtitle />
      {doc ? (
        <Markdown>{doc.description}</Markdown>
      ) : (
        // For the developer who opened Storybook: the guard test fails on a
        // missing docs file first, so no reader ever sees this.
        // eslint-disable-next-line lingui/no-unlocalized-strings -- KN-214
        <Markdown>{`_No story-docs entry for \`${title}\` in ${locale}._`}</Markdown>
      )}

      <Primary />
      <Controls />

      {doc && Object.keys(doc.props).length > 0 ? (
        <Markdown>
          {Object.entries(doc.props)
            .map(([name, prose]) => `### \`${name}\`\n\n${prose}`)
            .join('\n\n')}
        </Markdown>
      ) : null}

      {doc && Object.keys(doc.stories).length > 0 ? (
        <Markdown>
          {Object.entries(doc.stories)
            .map(([name, prose]) => `### ${name}\n\n${prose}`)
            .join('\n\n')}
        </Markdown>
      ) : null}

      <Stories />
    </>
  )
}
