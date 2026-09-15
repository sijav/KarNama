// The three places the product goes, as ids and nothing else, in a module with no
// React in it, so the build can write a page for each, KN-505. destinations.ts
// gives each its icon and its name, in the order the navigation draws them.
export type Destination = 'jobs' | 'add' | 'network'

export const DESTINATION_IDS: readonly Destination[] = ['jobs', 'add', 'network']
