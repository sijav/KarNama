import { devices, expect, test, type Locator, type Page } from '@playwright/test'

/**
 * The Button on a touch screen, KN-318, against the published Storybook's build, beside the
 * Icon Button's, KN-313. A tap leaves :hover on what was tapped, so the hover fill the
 * Button drew for every device stayed after a tap. The Matrix story holds every style in
 * every size with no state forced: in Playwright's Pixel 7, which has touch and no hover,
 * each of its fifteen enabled Buttons is tapped and keeps what it draws at rest; with the
 * check's own desktop Chrome, a pointer still fills each.
 */
const STORY = 'iframe.html?id=shared-button--matrix&viewMode=story'
// The Matrix's first fifteen: every style in every size, enabled, before the disabled.
const ENABLED = 15
// Twice MUI's short transition, 250 ms, over which the Button's fill eases: read before
// the ease has run, a fill still on its way in would read as the one at rest.
const EASE = 500

// A device in test.use inside a describe may not name its browser, which would force a
// new worker, so the Pixel 7 goes in without it.
const { defaultBrowserType: _browser, ...pixel } = devices['Pixel 7']

// The Matrix's enabled Buttons, once all thirty have rendered.
const enabledOf = async (page: Page) => {
  await page.goto(STORY)
  const buttons = page.getByRole('button')
  await expect(buttons).toHaveCount(ENABLED * 2)
  return Array.from({ length: ENABLED }, (_, index) => buttons.nth(index))
}

// What a Button draws, and whether it has :hover.
const drawn = (button: Locator) =>
  button.evaluate((element) => {
    const style = getComputedStyle(element)
    return { fill: style.backgroundColor, text: style.color, hovered: element.matches(':hover') }
  })

test.describe('on a touch screen', () => {
  test.use(pixel)

  test('a tap leaves every enabled Button as it is at rest', async ({ page }) => {
    const buttons = await enabledOf(page)
    expect(await page.evaluate(() => matchMedia('(hover: none)').matches)).toBe(true)
    for (const [index, button] of buttons.entries()) {
      const before = await drawn(button)
      await button.tap()
      // Past the ease, and past anything still animating on the Button.
      await page.waitForTimeout(EASE)
      await button.evaluate(async (element) => {
        await Promise.all(element.getAnimations().map((animation) => animation.finished))
      })
      const after = await drawn(button)
      // The check reproduces a phone only while a tap leaves :hover behind, which is what
      // the old rule followed. Were Chromium to stop leaving it, every Button would read as
      // at rest, fixed or not, so the test stands aside, saying why, rather than pass.
      test.skip(index === 0 && !after.hovered, 'a tap leaves no :hover in this Chromium, so the check reproduces no sticky hover')
      expect({ fill: after.fill, text: after.text }).toEqual({ fill: before.fill, text: before.text })
    }
  })
})

test('with a pointer, hovering fills every enabled Button', async ({ page }) => {
  const buttons = await enabledOf(page)
  expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(true)
  for (const button of buttons) {
    const before = await drawn(button)
    await button.hover()
    await expect.poll(async () => (await drawn(button)).fill).not.toBe(before.fill)
  }
})
