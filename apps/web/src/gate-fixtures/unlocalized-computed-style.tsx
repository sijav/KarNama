// getComputedStyle with a literal of copy where its pseudo-element goes. The rule
// exempted every literal in every getComputedStyle call, so a story could pass
// '::placeholder', until KN-257; the three selectors the stories pass are exempted by
// value now. The rule must reject this. See README.md in this directory.
export const copyAsPseudoElement = (element: Element) => getComputedStyle(element, 'Job title').color
