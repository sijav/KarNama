import { spyOn } from 'storybook/test'

/**
 * A Storage kept in memory, with every member the DOM's has, so it stands in
 * for localStorage without a cast.
 */
const memoryStorage = (): Storage => {
  const items = new Map<string, string>()
  return {
    get length() {
      return items.size
    },
    key: (index: number) => [...items.keys()][index] ?? null,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value)
    },
    removeItem: (key: string) => {
      items.delete(key)
    },
    clear: () => {
      items.clear()
    },
  }
}

/**
 * Every story gets a localStorage of its own, from before its first render,
 * and the real one back after, KN-178.
 *
 * The real store is one per origin, and the runner has several story files open
 * at once, each in a frame of its own, all sharing it. A story that chooses a
 * language or a colour scheme persists it. The Preferences Provider's stories
 * saved the stored value, wrote their own and put the old one back in a
 * finally, and that still raced another story doing the same: B saved A's value
 * as its own before, A restored, B put A's back, and the suite ended dirty,
 * while a story between a write and its restore read the other's choice. The
 * Language Switch's and the Sidebar's stories never restored at all.
 * `localStorage` is read from each frame's own window, so standing another in
 * for it in one frame reaches no other.
 */
export const withOwnStorage = () => {
  const own = spyOn(globalThis, 'localStorage', 'get').mockReturnValue(memoryStorage())
  return () => {
    own.mockRestore()
  }
}
