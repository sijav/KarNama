The thirty icons of the design, each drawn in a 24 by 24 grid with a two pixel
stroke and round ends, from link to note.

An icon takes one of the three sizes of the scale, 16, 20 or 24, and keeps its
two pixel stroke at each. It is the secondary text colour unless it is given
another colour role, or told to take the colour of what holds it. An icon is
decoration by default and hidden from screen readers; give it a name only when
it stands alone and means something, and then it is announced as an image.

## Props

### name

Which of the thirty icons to draw.

### size

The size from the scale: `sm` 16, `md` 20 or `base` 24, the default.

### color

A colour role from the theme, `text/secondary` by default, or `inherit` to take
the colour of the element around it.

### aria-label

The icon's name for screen readers. Leave it out when the icon sits beside text
that already says what it means.

## Stories

### Default

One icon at 24, in the secondary text colour, hidden from screen readers.

### AllIcons

The whole set in a grid, each with its name, at the size and colour set in the
controls.

### Sizes

One icon at 16, 20 and 24, the stroke two pixels at each.

### Coloured

The check in the brand text colour: the stroke follows the colour role.

### Named

The trash icon given a name, so it is an image a screen reader announces.
