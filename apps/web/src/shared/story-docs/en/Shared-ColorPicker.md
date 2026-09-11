The panel that sets a status's colour, from the design's colour picker: a
title, the nine status colours as round swatches, and a note under them.

A status's colour comes from a closed set, the nine pairs the board already
uses, five for the default statuses and four more, never a free colour: a
status still has to read as a status. The current colour carries an edge in its
own darker shade and a check. The swatches are one radio group, so Tab reaches
the chosen colour and the arrow keys move and choose, and each swatch is named
for its colour.

## Props

### value

The colour the status has now, one of the nine status tokens.

### onChange

Fired with the token of the colour picked, by pointer or by arrow key.

## Stories

### Default

The chosen colour is the interview amber, as the design draws it, in Persian.

### KeyboardOnly

Tab lands on the chosen colour and the arrow keys move through the nine,
choosing as they go, with no pointer anywhere.

### Picking

A click picks a colour and reports its token.

### InEnglish

The colour names in English, and the swatches running left to right.
