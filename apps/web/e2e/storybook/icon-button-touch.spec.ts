import { devices, expect, test, type Locator, type Page } from '@playwright/test'

/**
 * The Icon Button on a touch screen, KN-313, against the published Storybook's build.
 * A tap leaves :hover on what was tapped, so a hover fill drawn for every device stayed
 * after the tap, grey or the danger tone's pale red. In Playwright's Pixel 7, which has
 * touch and no hover, each tone is tapped and keeps what it draws at rest; with the
 * check's own desktop Chrome, a pointer still fills it.
 */
const STORY = 'iframe.html?id=shared-iconbutton--hover&viewMode=story'
// Twice the fill's ease, MUI's shortest transition of 150 ms: read before the ease has
// run, a fill still on its way in from transparent would read as no fill.
const EASE = 300

// A device in test.use inside a describe may not name its browser, which would force a
// new worker, so the Pixel 7 goes in without it.
const { defaultBrowserType: _browser, ...pixel } = devices['Pixel 7']

// The story's two buttons, neutral and danger, once they have rendered.
const buttonsOf = async (page: Page) => {
  await page.goto(STORY)
  const buttons = page.getByRole('button')
  await expect(buttons).toHaveCount(2)
  return [buttons.nth(0), buttons.nth(1)]
}

// What a button draws, and whether it has :hover.
const drawn = (button: Locator) =>
  button.evaluate((element) => {
    const style = getComputedStyle(element)
    return { fill: style.backgroundColor, icon: style.color, hovered: element.matches(':hover') }
  })

test.describe('on a touch screen', () => {
  test.use(pixel)

  test('a tap leaves each tone as it is at rest', async ({ page }) => {
    const buttons = await buttonsOf(page)
    expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(true)
    for (const button of buttons) {
      const before = await drawn(button)
      expect(before.fill).toBe('rgba(0, 0, 0, 0)')
      await button.tap()
      // Past the ease, and past anything still animating on the button.
      await page.waitForTimeout(EASE)
      await button.evaluate(async (element) => {
        await Promise.all(element.getAnimations().map((animation) => animation.finished))
      })
      // The tap leaves :hover behind, which is what the fill used to follow.
      expect(await drawn(button)).toEqual({ ...before, hovered: true })
    }
  })
})

test('with a pointer, hovering fills each tone', async ({ page }) => {
  const buttons = await buttonsOf(page)
  expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(true)
  for (const button of buttons) {
    const before = await drawn(button)
    await button.hover()
    await expect.poll(async () => (await drawn(button)).fill).not.toBe(before.fill)
    const hovered = await drawn(button)
    expect(hovered.hovered).toBe(true)
    expect(hovered.icon).not.toBe(before.icon)
  }
})
