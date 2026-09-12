import { Box, useMediaQuery, type Theme } from '@mui/material'
import { Sidebar, type SidebarProps } from './Sidebar'
import { TabBar } from './TabBar'

// The props are documented in story-docs, not here, KN-207.
export interface NavigationProps extends SidebarProps {
  selecting?: boolean
}

// The product's navigation, placed: the sidebar beside the page, full height
// and still as the page scrolls, from MUI's md, 900, up; below it the tab bar,
// pinned to the bottom of the screen. The file draws 390 and 1440 and nothing
// between, and DESIGN.md section 5 takes md as the line.
export const Navigation = ({ selecting = false, ...props }: NavigationProps) => {
  const wide = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), { noSsr: true })
  if (wide) {
    return (
      <Box sx={{ position: 'sticky', top: 0, flexShrink: 0, height: '100vh' }}>
        <Sidebar {...props} />
      </Box>
    )
  }
  // Node 185:19: the tab bar gives its place to the Bulk Action Bar while the
  // page is selecting, KN-356. Both are fixed to the foot of the screen at the
  // same layer, so on a phone they sat on top of each other. The sidebar is
  // beside the page and is untouched.
  if (selecting) return null
  return (
    <Box sx={(theme) => ({ position: 'fixed', insetInline: 0, bottom: 0, zIndex: theme.zIndex.appBar })}>
      <TabBar current={props.current} onNavigate={props.onNavigate} />
    </Box>
  )
}
