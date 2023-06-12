import { test, expect } from '@playwright/test'

test('Collapse 嵌套表单', async ({ page }) => {
  page.on('pageerror', (exception) => expect(exception).toBeNull())
  await page.goto('http://localhost:7130/pc/collapse/nested-form')

  const content = page.locator('.tiny-collapse-item__content')
  await expect(content.locator('.tiny-form')).toBeVisible()
})