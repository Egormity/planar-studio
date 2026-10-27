import type { Page } from '@playwright/test';

export async function center(page: Page, id: string) {
  return page.getByTestId(`item-${id}`).evaluate((element) => {
    const matrix = (element as unknown as SVGGraphicsElement).getScreenCTM()!;
    const point = new DOMPoint(0, 0).matrixTransform(matrix);
    return { x: point.x, y: point.y };
  });
}
export async function selectItem(page: Page, id: string) {
  const point = await center(page, id);
  await page.mouse.click(point.x, point.y);
}
export async function editNumber(page: Page, label: string, value: string) {
  await page.getByRole('spinbutton', { name: label, exact: true }).fill(value);
  await page.getByRole('spinbutton', { name: label, exact: true }).press('Enter');
}
export async function savedDocument(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('planar.document.v1') ?? 'null'));
}
