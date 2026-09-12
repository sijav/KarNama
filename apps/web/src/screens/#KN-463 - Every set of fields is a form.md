# KN-463 · Every set of fields is a form

Beside the screens, per `agent/RALPH.md` step 2b. Written before the work.

## The card

The owner, 2026-09-12: "the inputs should always be in a form, onsubmit needs to
be the one responsible for next button, next button needs to call onsubmit".

**Why.** Enter is how a form is finished, and on a phone it is the difference
between a keyboard that offers Go and one that does not. It is also what
autofill and a password manager look for, which is what makes the sign-in number
rememberable.

**Exit condition.** Every screen and modal that takes fields wraps them in a
form whose `onSubmit` does the work, its primary button is `type=submit`, and a
story presses Enter in a field and sees the same thing the button does.

## The approach

`Button` already takes `type`, so nothing in it changes.

**The sign-in screen.** Its card is already one `Stack` holding the current
step. The Stack becomes the form, and its `onSubmit` routes to whatever the
current step's primary action is: save the name, check the code, or ask for a
code. The primary button of each step becomes `type="submit"` and loses its
`onClick`; the quiet "Send another code" stays a button with its own handler,
because it is not what finishing this form means.

**The modals.** Their actions are rendered in a footer slot, outside the element
that holds the fields, so a submit button there is not a descendant of the form.
HTML's own answer is the `form` attribute: the button names the form's id and
submits it from anywhere in the document. The fields get a form with an id from
`useId`, and the primary action carries `form={id} type="submit"`.

That needs `Button` to pass a `form` attribute through, which it does not today.
One prop, and it is a real part of a button's contract rather than a test hook.

**Which places.** The three sign-in steps, the contact modal, the add flow's
paste step and its manual form, the rename modal on the board, and the job
modal's save.

## What I am unsure about

- Whether a submit inside a MUI `Dialog` does anything unexpected: the dialog
  traps focus, and a form with a single text field submits on Enter implicitly,
  which is what we want, but I have not checked that MUI does not already
  swallow Enter somewhere.
- Whether any of these forms has two submit-ish actions, in which case the
  wrong one could become the implicit default.
- The add flow has TWO forms in sequence in one dialog, paste and then the
  manual fields; they must not become one form, or Enter in the paste field
  would save a draft nobody filled in.

## Corrected after the plan roast, 2026-09-12

- **Every `onSubmit` calls `preventDefault`.** Without it a successful native
  submit navigates and the page reloads, which is the one way this change could
  make things worse than they were.
- `form={id}` does associate through a portal and does take part in implicit
  submission: the default submitter is the first submit button whose form owner
  is that form, wherever it sits in the document. MUI's Dialog does not swallow
  Enter; its modal handler only reads Escape.
- One form around the sign-in card is right. React replaces the handler on every
  render, so a step change cannot carry a stale one.
- **The Change Status modal counts too**: it holds a real radio group and a
  confirm action.
- **Enter stays a newline in every textarea**: the paste step, and the job
  modal's note and description. Those forms are still forms and their footer
  button still submits them, but the Enter story is told on a single-line field,
  and the exception is written down rather than tested away.
- A form alone does not give a phone's keyboard a Go key, or autofill anything.
  That needs `autoComplete`, `inputMode`, `enterKeyHint` and a real input type,
  none of which the Input offers today. Filed separately rather than folded in
  here, since it is its own piece of work and the owner asked for the form.

## How I will know it worked

A story for each place presses Enter in a field and sees exactly what pressing
the primary button does; the existing button-click stories keep passing, which
is what says the button still works through the form.
