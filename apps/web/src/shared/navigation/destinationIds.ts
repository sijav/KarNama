// The places the product goes, as ids and nothing else, in a module with no React
// in it, so the build can write a page for each, KN-505: the board, adding a job
// opportunity, which is a modal over the board with an address of its own, the
// Stats page and the network page. destinations.ts gives each its icon and its
// name, and says which the sidebar and the tab bar draw, KN-796.
export type Destination = 'jobs' | 'add' | 'stats' | 'network'

export const DESTINATION_IDS: readonly Destination[] = ['jobs', 'add', 'stats', 'network']
