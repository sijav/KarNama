// The physical side a popover hangs from at the inline end: MUI's Popover
// places by left and right and does not mirror, so each direction names its
// own. Typed, so the side is a value and not copy.
export type Side = 'left' | 'right'
const LEFT: Side = 'left'
const RIGHT: Side = 'right'
export const inlineEndOf = (direction: 'rtl' | 'ltr'): Side => (direction === 'rtl' ? LEFT : RIGHT)
