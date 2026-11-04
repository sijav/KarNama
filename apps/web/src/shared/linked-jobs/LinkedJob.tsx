import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useId } from 'react'
import { spacing, type as typeScale, type StatusToken } from '../../theme/tokens'
import { IconButton } from '../icon-button'
import { labelText, oneLine } from '../related-person/personText'
import { StatusChip } from '../status-chip'

// The props are documented in story-docs, not here, KN-207.
export interface LinkedJobProps {
  title: string
  company?: string | null
  status: { token: StatusToken; name: string }
  onUnlink: () => void
}

// Node 1092:2997 binds no variable to these: the row's 56 and its status
// stripe, 3 by 32, at the inline start.
const ROW = 56
const STRIPE_WIDTH = 3
const STRIPE_HEIGHT = 32

// The class on the unlink button, so the row's hover and focus can show it.
const ACTIONS = 'KarnamaLinkedJob-actions'

// The title in Body, the company in Label: each one line, cut at its end.
export const jobTitleText = {
  sx: { fontSize: `${typeScale.body.size}px`, lineHeight: `${typeScale.body.lineHeight}px`, fontWeight: typeScale.body.weight },
}

// A status's stripe, 3 wide in its base colour, at the height its row gives.
export const StatusStripe = ({ status, height }: { status: StatusToken; height: number }) => (
  <Box aria-hidden sx={(theme) => ({ flexShrink: 0, width: STRIPE_WIDTH, height, backgroundColor: theme.karnama.status[status].base })} />
)

// Linked Job, node 1092:2997, Default and Hover: a job opportunity linked to a
// person, in the person's modal. A row 56 tall, 8 above and below and 12 at
// the sides, 12 between: from the inline start its status's stripe, its title
// in Body over its company in Label text/secondary, its status's small chip,
// and the Neutral Icon Button that unlinks it, shown under the pointer, with
// focus inside and always where there is no hover. Hover fills the row with
// bg/surface-secondary. The row is a group named by the title, so the button is
// heard with which job opportunity it unlinks.
export const LinkedJob = ({ title, company, status, onUnlink }: LinkedJobProps) => {
  const { i18n } = useLingui()
  const titleId = useId()
  return (
    <Box
      role="group"
      aria-labelledby={titleId}
      sx={(theme) => {
        const lit = { backgroundColor: theme.karnama.semantic['bg/surface-secondary'], [`& .${ACTIONS}`]: { opacity: 1 } }
        return {
          boxSizing: 'border-box',
          width: '100%',
          height: ROW,
          display: 'flex',
          alignItems: 'center',
          gap: `${spacing.sm}px`,
          paddingBlock: `${spacing.xs}px`,
          paddingInline: `${spacing.sm}px`,
          backgroundColor: theme.karnama.semantic['bg/surface'],
          [`& .${ACTIONS}`]: { opacity: 0 },
          '@media (hover: hover)': { '&:hover': lit },
          '@media (hover: none)': { [`& .${ACTIONS}`]: { opacity: 1 } },
          '&:focus-within': lit,
        }
      }}
    >
      <StatusStripe status={status.token} height={STRIPE_HEIGHT} />
      <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box component="span" id={titleId} sx={(theme) => ({ ...jobTitleText.sx, ...oneLine.sx, color: theme.karnama.semantic['text/primary'] })}>
          {title}
        </Box>
        {company === undefined || company === null || company === '' ? null : (
          <Box component="span" sx={(theme) => ({ ...labelText.sx(theme), ...oneLine.sx })}>
            {company}
          </Box>
        )}
      </Box>
      <StatusChip status={status.token} label={status.name} size="S" />
      <Box className={ACTIONS} sx={{ display: 'flex', flexShrink: 0 }}>
        <IconButton icon="link-off" aria-label={i18n._('Unlink')} onClick={onUnlink} />
      </Box>
    </Box>
  )
}
