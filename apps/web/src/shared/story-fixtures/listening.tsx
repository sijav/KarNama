import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Marks that the providers inside it are listening, KN-560.
 *
 * A provider adds its `storage` listener in a passive effect, which a production
 * canvas runs after a play has started, and an event nobody listens for is lost.
 * React runs a parent's passive effects after its children's, so this draws an
 * empty span before its children and hides it in its own effect: once a play
 * sees that span hidden, every provider inside it has added its listener.
 *
 * It WRAPS the providers it speaks for and never sits inside them, which is the
 * whole mechanism, KN-560's plan review. A tree holds more than one mark, so
 * each carries the id of what it covers, KN-564: the preview's own providers
 * around every story, a story file's meta around the board it seeds, and a
 * story's own provider inside those.
 */
export const ListeningAround = ({ mark, children }: { mark: string; children: ReactNode }) => {
  const span = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (span.current) span.current.hidden = true
  }, [])
  return (
    <>
      <span data-testid={mark} ref={span} />
      {children}
    </>
  )
}

// The three marks, by the test ids they draw. Identifiers a story looks itself
// up by, never words anyone reads, as a storage key is, so they are named here
// rather than translated.
/* eslint-disable lingui/no-unlocalized-strings -- KN-564: test ids */

/** The preview's own providers, around every story. */
export const PREVIEW_LISTENING = 'listening-preview'

/** A story file's meta, around the board it seeds. */
export const BOARD_LISTENING = 'listening-board'

/** A story's own provider, inside both of those: the mark KN-560 drew. */
export const OWN_LISTENING = 'listening'

/* eslint-enable lingui/no-unlocalized-strings */
