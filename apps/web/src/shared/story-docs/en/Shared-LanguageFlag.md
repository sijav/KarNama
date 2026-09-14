The flag of a language's region, drawn beside that language's name.

Persian takes the flag of Iran and English the flag of the United States. The
flags come from a package, `country-flag-icons`, rather than being drawn here,
which was the owner's decision. A flag is three wide by two tall across the
width of a 20 pixel icon, with rounded corners and a hairline around its edge,
so a flag with a white edge still shows on a white surface. It is decoration by
default and hidden from screen readers, because it sits beside the language's
written name; give it a name only when it stands alone.

## Props

### locale

The language whose flag to draw, `fa-IR` or `en-US`.

### aria-label

The flag's name for screen readers, which makes it an image. Leave it out when
the language's name is already written beside it.

## Stories

### Persian

The flag of Iran, for Persian, hidden from screen readers.

### English

The flag of the United States, for English.

### Named

A flag given a name, announced as an image with that name, as a control made of
the flag alone will need.
