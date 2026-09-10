Holds the two preferences that change how everything else renders: the language
and the colour scheme.

The story renders a probe from its **args** rather than from a decorator, so the
seeded state is visible in the Controls table instead of buried in a wrapper.

## Props

### initialLocale

The language the provider starts in.

### initialColorScheme

The colour scheme the provider starts in. `system` follows the operating system
rather than pinning a value.

## Stories

### Persian

Seeded Persian and light, which is the product default.

### English

Seeded English, where the direction flips to left-to-right.
