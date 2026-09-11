The desktop navigation, down the side of the screen that faces the start of the
page, the right in Persian.

From the top: the product's name and mark, the signed-in user with their phone,
and under «فضای کار» the three places the product goes, the board, adding a job
opportunity and the network, the current one marked. At the foot, where the
design leaves room, the language switch and signing out. Before anyone signs
in, the user and signing out are left out.

## Props

### current

The place the reader is on: `jobs`, `add` or `network`.

### userName

The signed-in user's name. Without it the user is not shown.

### userPhone

The signed-in user's phone, shown in the reader's digits.

### onNavigate

Called with the place pressed.

### onSignOut

Called when «خروج» is pressed. Without it there is no «خروج».

## Stories

### Default

The sidebar as the design draws it, measured, a place and signing out pressed.

### NetworkCurrent

The sidebar on the network page.

### WithoutUser

Before anyone signs in: no user and no signing out.

### SwitchLanguage

The language switch at the foot turned to English; the sidebar follows and its
edge moves to the right.

### InEnglish

The sidebar in English, down the left of the screen.
