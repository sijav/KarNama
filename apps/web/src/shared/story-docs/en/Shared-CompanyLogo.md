A company's logo in the small rounded square at the head of a job's card, 36
by 36. The logo is fetched from the company's own website, or else from its
LinkedIn page, and drawn covering the square. Where neither has one, or the
logo fails to load, the square shows the default organisation icon instead: a
grey outline of a building on a light grey ground.

It is decoration, hidden from screen readers either way, because the card
writes the company's name beside it.

## Props

### src

The logo's address. Leave it out, or give one that fails to load, and the
building is drawn instead.

## Stories

### Default

The default organisation icon, measured against the design: the 36 square, its
light grey ground, and the building at 18 in the disabled text colour.

### WithALogo

A logo of the story's own covering the square at the same rounded corners.

### BrokenLogo

A logo that fails to load gives way to the building.

### InEnglish

The same icon in English. It has no direction, so it is not mirrored.

### Dark

The icon in the dark scheme, in the theme's dark colours.
