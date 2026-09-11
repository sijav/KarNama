A row of tabs and the panels they show, from the design's tab item: each tab a
label over a thin line, the chosen one in the brand colour and a heavier
weight, and a hovered one with a grey line.

It is the job opportunity window's row of sections. Tab reaches the chosen tab,
the arrow keys move along the row, turning round in Persian so the arrow that
points the way the row runs goes on, Home and End go to either end, and Enter
or Space chooses. Every panel stays mounted and is hidden unless chosen, so
nothing typed in one is lost by moving to another. The focus ring is drawn
inside the tab, since the row cuts off whatever overflows it.

## Props

### aria-label

The name of the row of tabs, read out when a screen reader reaches it.

### value

The value of the chosen tab.

### onChange

Fired with the value of the tab chosen, by pointer or by keyboard.

### tabs

The tabs in order, each with its value, its label already in the reader's
language, and its panel.

## Stories

### Default

The job opportunity window's five tabs, the first chosen, in Persian.

### KeyboardOnly

Tab to the chosen tab, the arrow to move on, Enter to choose, and End to reach
the last, with no pointer anywhere.

### Hover

A pointer over a tab darkens its label and draws the grey line. The story moves
a real pointer when it runs as a test; in Storybook itself, hover a tab
yourself.

### InEnglish

The labels in English, the row running left to right.
