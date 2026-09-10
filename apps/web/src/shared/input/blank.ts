// An error needs something to read. A message is blank when every character in
// it carries nothing to read on its own: whitespace; a format character, the
// zero-width non-joiner of Persian text among them, and the few that draw a
// sign, such as the Arabic number sign U+0600, which say nothing alone either;
// a mark with no letter under it, the variation selectors among them; a
// default-ignorable code point, the Hangul fillers among them; or the braille
// blank, U+2800, a symbol that draws nothing. One letter, digit, punctuation
// mark or symbol beyond those makes it a real message, whatever else sits
// inside it, so a Persian message keeps its zero-width non-joiners and still
// shows. KN-254, KN-259, KN-261.
const BLANK = /^[\s\p{Cf}\p{M}\p{Default_Ignorable_Code_Point}\u2800]*$/u

export const isBlank = (text: string) => BLANK.test(text)
