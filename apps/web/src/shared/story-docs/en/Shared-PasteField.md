The add form's first field, where a posting's link or its whole text goes:
«لینک آگهی یا متن کامل آگهی», Posting link or full text, over a white field one
line tall that says «لینک یا متن کامل آگهی رو اینجا بذارید», Put the posting
link or its full text here, and under it «هم لینک، هم متن کامل آگهی؛ لازم نیست
چیزی رو جدا کنید.», A link or the full posting text; no need to separate
anything. Pasted text makes it grow a line at a time, up to eight, then it
scrolls.

Its edge is grey, darker under the pointer and blue and thicker while typing.
When reading the posting fails, the reason replaces the helper in red, and the
edge turns red.

## Props

### value

What is in the field.

### onChange

Called with the field's whole text whenever it changes.

### error

Why reading the posting failed, shown in place of the helper; leave it out
otherwise.

### onFocus

Called when the field takes focus, which is when the form counts it touched.

## Stories

### Default

The empty field measured against the design: its label, its line, its helper.

### Hover

The pointer over it: the darker edge.

### Focus

Pressed into: the blue edge, and the form told.

### Filled

A link pasted, in the primary text colour, the field still one line.

### LongText

A whole posting pasted: the field grows a line at a time.

### WithError

Reading failed: the reason in red in the helper's place.

### Typing

Typed into, each change handed over.

### InEnglish

The same field in English.

### Dark

The field in the dark scheme, in the theme's dark colours.
