import { Box, Tab, Tabs as MuiTabs } from '@mui/material'
import { useId, type ReactNode } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'

// One tab and the panel it shows. The label arrives translated from the
// caller, as every piece of copy a component is given does.
export interface TabsItem {
  value: string
  label: string
  panel: ReactNode
}

// The props are documented in story-docs, not here, KN-207.
export interface TabsProps {
  'aria-label': string
  value: string
  onChange: (value: string) => void
  tabs: readonly TabsItem[]
}

// Node 204:20's indicator, two pixels, and the focus ring drawn inside the
// tab, three: the row clips, as the file draws it, so a ring round a tab would
// be lost, and WCAG's understanding of 2.4.13 asks an indicator inset from the
// edge to be thicker than two, KN-023. Stroke weights bind no variable.
const INDICATOR = 2
const FOCUS_RING = 3
const EDGE = 1

// A panel is a tab stop only when nothing in it is, KN-302, as the WAI-ARIA
// tabs pattern asks: Tab from the tab list goes straight to a panel's first
// field, and to a panel of text alone on the panel itself. Read from what the
// panel renders and shows, and read again whenever that changes, since its
// content can arrive after it mounts and a hidden panel's shows when chosen.
// The DOM keeps the attribute rather than React, so the answer is there before
// the next key, and it is written only when it changes, since a write is a
// mutation too and would wake the observer again.
const watchStops = (panel: HTMLDivElement) => {
  const read = () => {
    const tabbable = [...panel.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]')].some(
      (element) => element.tabIndex >= 0 && !element.matches(':disabled') && element.checkVisibility(),
    )
    if (tabbable === panel.hasAttribute('tabindex')) {
      if (tabbable) panel.removeAttribute('tabindex')
      else panel.tabIndex = 0
    }
  }
  read()
  const observer = new window.MutationObserver(read)
  observer.observe(panel, { subtree: true, childList: true, attributes: true })
  return () => {
    observer.disconnect()
  }
}

// The tablist and its panels: the Tab Item of node 204:20 in the row the Job
// Modal draws at 210:101. MUI's Tabs gives the roles, aria-selected, the
// roving tabindex, arrow keys that turn round in RTL, Home and End, and Enter
// and Space to choose; every panel stays mounted, hidden unless chosen, so
// what is typed in one survives a switch.
export const Tabs = ({ 'aria-label': label, value, onChange, tabs }: TabsProps) => {
  const base = useId()
  // Element ids, never shown.
  /* eslint-disable lingui/no-unlocalized-strings -- KN-214: element ids */
  const tabId = (item: TabsItem) => `${base}-tab-${item.value}`
  const panelId = (item: TabsItem) => `${base}-body-${item.value}`
  /* eslint-enable lingui/no-unlocalized-strings */

  return (
    <Box>
      <MuiTabs
        value={value}
        aria-label={label}
        variant="scrollable"
        scrollButtons={false}
        onChange={(_, chosen: unknown) => {
          const item = tabs.find((tab) => tab.value === chosen)
          if (item) onChange(item.value)
        }}
        // MUI's one sliding indicator is off: the file draws one under every
        // tab, Hover's included, so each tab draws its own.
        slotProps={{ indicator: { sx: { display: 'none' } }, list: { sx: { gap: `${spacing['2xs']}px` } } }}
        sx={(theme) => ({
          // The row at 210:14: 44 tall, 16 at each side, and a one pixel edge
          // along the bottom, inside, on a ::before so the tabs paint over it.
          position: 'relative',
          minHeight: 0,
          paddingInline: `${spacing.md}px`,
          '&::before': {
            content: '""',
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            borderBottomStyle: 'solid',
            borderBottomWidth: EDGE,
            borderBottomColor: theme.karnama.semantic['border/default'],
            pointerEvents: 'none',
          },
        })}
      >
        {tabs.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={item.label}
            id={tabId(item)}
            aria-controls={panelId(item)}
            disableRipple
            sx={(theme) => {
              const colour = theme.karnama.semantic
              return {
                // Node 204:15: 12 above, 16 at the sides, none below, the 22
                // line, 8, then the indicator; 44 tall, hugging its label.
                minWidth: 0,
                minHeight: 0,
                maxWidth: 'none',
                paddingTop: `${spacing.sm}px`,
                paddingInline: `${spacing.md}px`,
                paddingBottom: `${spacing.xs + INDICATOR}px`,
                textTransform: 'none',
                fontSize: `${typeScale.body.size}px`,
                lineHeight: `${typeScale.body.lineHeight}px`,
                fontWeight: typeScale.label.weight,
                letterSpacing: 0,
                color: colour['text/secondary'],
                opacity: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  insetInline: `${spacing.md}px`,
                  bottom: 0,
                  height: INDICATOR,
                  backgroundColor: 'transparent',
                  pointerEvents: 'none',
                },
                '&:hover': { color: colour['text/primary'] },
                '&:hover::after': { backgroundColor: colour['border/default'] },
                // Active, 204:19: the brand text at the headings' 600, the
                // brand indicator, and no hover change over it.
                '&.Mui-selected, &.Mui-selected:hover': { color: colour['text/brand'], fontWeight: typeScale['heading/m'].weight },
                '&.Mui-selected::after, &.Mui-selected:hover::after': { backgroundColor: colour['bg/brand/default'] },
                '&.Mui-focusVisible::before': {
                  content: '""',
                  position: 'absolute',
                  inset: EDGE,
                  borderRadius: `${theme.karnama.radius.sm}px`,
                  borderStyle: 'solid',
                  borderWidth: FOCUS_RING,
                  borderColor: colour['border/focus'],
                  pointerEvents: 'none',
                },
              }
            }}
          />
        ))}
      </MuiTabs>
      {tabs.map((item) => (
        <Box
          key={item.value}
          ref={watchStops}
          role="tabpanel"
          id={panelId(item)}
          aria-labelledby={tabId(item)}
          hidden={item.value !== value}
        >
          {item.panel}
        </Box>
      ))}
    </Box>
  )
}
