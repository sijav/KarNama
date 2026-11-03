One bar of the Stats page's applications by week: the week's count, small and
centred, with its bar under it. The page gives each bar a height in proportion
to its count, and the bar fills what is left under the number. This week's bar
is drawn strong, the brand's blue under a black count; the others are pale
blue under a grey one. A week with none keeps a pixel of bar.

The bar only draws the count, so a screen reader reads the count and passes
over the bar.

## Props

### count

The week's applications, written above the bar in the reader's digits.

### current

Whether this is this week, drawn strong.

### height

The whole bar's height, count included, which the page sets in proportion to
the count; 68 by default, the design's specimen. Never less than the count and
a pixel of bar, 21.

## Stories

### Default

A past week measured against the design.

### Current

This week, drawn strong.

### AWeekOfHeights

Four weeks of different heights, from none to this week's.

### InEnglish

The same bar with Latin digits.

### Dark

A past week and this week in the dark scheme, in the theme's dark colours.
