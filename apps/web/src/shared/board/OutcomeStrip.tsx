import { Box, ButtonBase } from '@mui/material'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { unstyledText, type StatusToken } from '../../theme/tokens'
import { Icon, type IconName } from '../icon'

export type Outcome = 'accepted' | 'rejected' | 'no-response' | 'withdrawn'

// The props are documented in story-docs, not here, KN-207.
export interface OutcomeStripProps {
  outcome: Outcome
  name: string
  count: number
  onOpen: () => void
}

// Each outcome's icon, and the status pair the two that have one are drawn
// in; the others take the strip's own greys, as the board's instances of
// 638:7928 draw them.
const ICONS: Record<Outcome, IconName> = { accepted: 'check', rejected: 'x', 'no-response': 'clock', withdrawn: 'log-out' }

type Paired = Extract<Outcome, 'accepted' | 'rejected'>
const PAIRS: Record<Paired, StatusToken> = { accepted: 'custom-1', rejected: 'rejected' }
const isPaired = (outcome: Outcome): outcome is Paired => outcome in PAIRS

// Node 638:7928 binds no variable to these: the strip's 88, its 18 above, 14
// below and 8 at the sides, the 6 between its parts, its radius of 16, and the
// count pill's 1 and 8. The keyboard's ring is the three drawn inside its edge
// that the status tabs draw, KN-294.
const WIDTH = 88
const TOP = 18
const BOTTOM = 14
const SIDES = 8
const GAP = 6
const RADIUS = 16
const PILL_BLOCK = 1
const PILL_INLINE = 8
const FOCUS_RING = 3

const name = unstyledText.outcomeStripName
const counted = unstyledText.outcomeStripCount

// Board / Outcome Strip, node 638:7928: a closed outcome after the board's
// stages, which opens into its column, KN-805. A strip 88 wide the board's
// height, bg/surface-secondary at radius 16, its parts centred from the top 6
// apart: the outcome's icon at 20, its name at 13 on 20 SemiBold and its count
// at 12 on 19 Medium in a pill. Accepted draws all three in the custom-1 pair's
// base, the pill in its container, and rejected in the rejected pair; no
// response and withdrawn take text/secondary on a bg/surface pill. A button
// named by its name and count.
export const OutcomeStrip = ({ outcome, name: label, count, onOpen }: OutcomeStripProps) => {
  const { locale } = usePreferences()
  return (
    <ButtonBase
      disableRipple
      onClick={onOpen}
      sx={(theme) => {
        const pair = isPaired(outcome) ? theme.karnama.status[PAIRS[outcome]] : null
        return {
          position: 'relative',
          flexShrink: 0,
          boxSizing: 'border-box',
          width: WIDTH,
          alignSelf: 'stretch',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: `${GAP}px`,
          paddingTop: `${TOP}px`,
          paddingBottom: `${BOTTOM}px`,
          paddingInline: `${SIDES}px`,
          borderRadius: `${RADIUS}px`,
          backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
          color: pair === null ? theme.karnama.semantic['text/secondary'] : pair.base,
          fontFamily: 'inherit',
          '&.Mui-focusVisible::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            borderStyle: 'solid',
            borderWidth: FOCUS_RING,
            borderColor: theme.karnama.semantic['border/focus'],
            pointerEvents: 'none',
          },
        }
      }}
    >
      <Icon name={ICONS[outcome]} size="md" color="inherit" />
      <Box
        component="span"
        sx={{
          alignSelf: 'stretch',
          textAlign: 'center',
          fontSize: `${name.size}px`,
          lineHeight: `${name.lineHeight}px`,
          fontWeight: name.weight,
          letterSpacing: `${name.letterSpacing}px`,
        }}
      >
        {label}
      </Box>
      <Box
        component="span"
        sx={(theme) => ({
          paddingBlock: `${PILL_BLOCK}px`,
          paddingInline: `${PILL_INLINE}px`,
          borderRadius: `${theme.karnama.radius.full}px`,
          backgroundColor: isPaired(outcome) ? theme.karnama.status[PAIRS[outcome]].container : theme.karnama.semantic['bg/surface'],
          fontSize: `${counted.size}px`,
          lineHeight: `${counted.lineHeight}px`,
          fontWeight: counted.weight,
          letterSpacing: `${counted.letterSpacing}px`,
        })}
      >
        {formatCount(locale, count)}
      </Box>
    </ButtonBase>
  )
}
