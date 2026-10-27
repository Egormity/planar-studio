import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { center, editNumber, savedDocument, selectItem } from './helpers';

test('direct manipulation is one undo step, survives zoom and cancels without changes', async ({
  page,
}) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4442')) external.push(request.url());
  });
  await page.goto('/');
  await page.getByTestId('plan-canvas').waitFor();
  await page.screenshot({ path: '.playwright/desktop-plan.png', fullPage: true });
  const sofa = page.getByTestId('item-living-sofa');
  await selectItem(page, 'living-sofa');
  await expect(sofa).toHaveAttribute('data-x', '310');
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  const start = await center(page, 'living-sofa');
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 75, start.y + 25, { steps: 10 });
  await page.mouse.up();
  expect(Number(await sofa.getAttribute('data-x'))).toBeGreaterThan(310);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(sofa).toHaveAttribute('data-x', '310');
  await expect(sofa).toHaveAttribute('data-y', '105');
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  const cancelStart = await center(page, 'living-sofa');
  await page.mouse.move(cancelStart.x, cancelStart.y);
  await page.mouse.down();
  await page.mouse.move(cancelStart.x + 60, cancelStart.y + 25, { steps: 5 });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(sofa).toHaveAttribute('data-x', '310');
  await expect(sofa).toHaveAttribute('data-y', '105');
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Pan view', exact: true }).click();
  const canvas = (await page.getByTestId('plan-canvas').boundingBox())!;
  await page.mouse.move(canvas.x + 70, canvas.y + 70);
  await page.mouse.down();
  await page.mouse.move(canvas.x + 110, canvas.y + 100);
  await page.mouse.up();
  await expect(sofa).toHaveAttribute('data-x', '310');
  await page.getByRole('button', { name: 'Fit plan', exact: true }).click();
  await expect(page.getByTestId('plan-canvas')).toHaveAttribute('data-zoom', '1');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('inspector, room constraints, add/duplicate/delete, history and reload operate on the document', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Linen sofa', exact: true }).click();
  await expect(page.getByTestId('plan-canvas').locator('[data-item-id]')).toHaveCount(7);
  await editNumber(page, 'Object width', '2.8');
  await editNumber(page, 'Rotation', '45');
  await editNumber(page, 'Room width', '3');
  const doc = await savedDocument(page);
  for (const item of doc.items) {
    const angle = (item.rotation * Math.PI) / 180;
    const xHalf =
      (Math.abs(Math.cos(angle)) * item.width + Math.abs(Math.sin(angle)) * item.depth) / 2;
    expect(item.x - xHalf).toBeGreaterThanOrEqual(-0.001);
    expect(item.x + xHalf).toBeLessThanOrEqual(300.001);
  }
  await page.getByRole('button', { name: 'Duplicate object', exact: true }).click();
  await expect(page.getByTestId('plan-canvas').locator('[data-item-id]')).toHaveCount(8);
  await page.getByRole('button', { name: 'Delete object', exact: true }).click();
  await expect(page.getByTestId('plan-canvas').locator('[data-item-id]')).toHaveCount(7);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByTestId('plan-canvas').locator('[data-item-id]')).toHaveCount(8);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  const expected = await savedDocument(page);
  await page.reload();
  await expect(page.getByRole('spinbutton', { name: 'Room width', exact: true })).toHaveValue('3');
  expect(await savedDocument(page)).toEqual(expected);
  await page.getByRole('button', { name: 'Load A place to create', exact: true }).click();
  await expect(page.getByTestId('item-office-desk')).toBeVisible();
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByTestId('item-living-sofa')).toBeVisible();
});

test('JSON round-trips, malformed imports preserve the plan, and SVG is portable and escaped', async ({
  page,
}) => {
  await page.goto('/');
  await selectItem(page, 'living-sofa');
  const label = '<script>alert(1)</script> & linen';
  await page.getByRole('textbox', { name: 'Object name', exact: true }).fill(label);
  await page.getByRole('textbox', { name: 'Object name', exact: true }).press('Enter');
  const jsonDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON', exact: true }).click();
  const json = await readFile((await (await jsonDownload).path())!, 'utf8');
  const exported = JSON.parse(json);
  expect(exported.items.find((item: { id: string }) => item.id === 'living-sofa').label).toBe(
    label,
  );
  await page.getByRole('button', { name: 'Load A place to create', exact: true }).click();
  await page.getByLabel('Import layout file').setInputFiles({
    name: 'layout.json',
    mimeType: 'application/json',
    buffer: Buffer.from(json),
  });
  await expect(page.getByTestId('item-living-sofa')).toBeVisible();
  expect(await savedDocument(page)).toEqual(exported);
  await page.getByLabel('Import layout file').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole('alert')).toContainText('unsupported');
  expect(await savedDocument(page)).toEqual(exported);
  await page.getByRole('button', { name: 'Dismiss message', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await selectItem(page, 'living-sofa');
  const svgDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export SVG', exact: true }).click();
  const svg = await readFile((await (await svgDownload).path())!, 'utf8');
  const parsed = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, 'image/svg+xml');
    return {
      error: !!doc.querySelector('parsererror'),
      script: !!doc.querySelector('script'),
      external: !!doc.querySelector('[href],foreignObject'),
      title: [...doc.querySelectorAll('title')].map((e) => e.textContent),
      viewBox: doc.documentElement.getAttribute('viewBox'),
      controls: !!doc.querySelector('[role="button"],[data-testid]'),
    };
  }, svg);
  expect(parsed).toMatchObject({ error: false, script: false, external: false, controls: false });
  expect(parsed.title).toContain(label);
  expect(parsed.viewBox).not.toBe(await page.getByTestId('plan-canvas').getAttribute('viewBox'));
});

test('storage failures keep editing usable and numeric Escape does not commit', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    Storage.prototype.setItem = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss message', exact: true }).click();
  const width = page.getByRole('spinbutton', { name: 'Room width', exact: true });
  await width.fill('8');
  await width.press('Escape');
  await expect(width).toHaveValue('6.4');
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Add Indoor plant', exact: true }).click();
  await expect(page.getByTestId('plan-canvas').locator('[data-item-id]')).toHaveCount(7);
  await expect(page.getByRole('alert')).toContainText('could not be saved');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByTestId('plan-canvas').locator('[data-item-id]')).toHaveCount(6);
});

test('touch cancellation restores geometry, committed touch edits undo, and phone layout fits', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4442/');
  await page.getByTestId('plan-canvas').scrollIntoViewIfNeeded();
  const point = await center(page, 'living-sofa');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: point.x, y: point.y }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: point.x + 35, y: point.y + 15 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await expect(page.getByTestId('item-living-sofa')).toHaveAttribute('data-x', '310');
  await expect(page.getByRole('button', { name: 'Undo', exact: true })).toBeDisabled();
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: point.x, y: point.y }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: point.x + 35, y: point.y + 15 }],
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(Number(await page.getByTestId('item-living-sofa').getAttribute('data-x'))).toBeGreaterThan(
    310,
  );
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(page.getByTestId('item-living-sofa')).toHaveAttribute('data-x', '310');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByTestId('plan-canvas').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '.playwright/mobile-plan.png' });
  await context.close();
});
