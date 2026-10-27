import { describe, expect, it } from 'vitest';
import type { PlanDocument } from '../model/types';
import { exportSvg } from './exportSvg';
import { constrainPan, viewBox } from './viewport';

const document: PlanDocument = {
  version: 1,
  name: 'Room <script>alert(1)</script>',
  room: { width: 640, depth: 480, floor: 'oak' },
  items: [
    {
      id: 'sofa-1',
      kind: 'sofa',
      label: 'Sofa & "chair"',
      x: 200,
      y: 100,
      width: 180,
      depth: 80,
      rotation: 90,
      color: '#78947d',
    },
  ],
};

describe('presentation export and camera', () => {
  it('exports escaped standalone artwork without an interactive scene or external resources', async () => {
    const svg = await exportSvg(document);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('Room &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(svg).toContain('Sofa &amp; &quot;chair&quot;');
    expect(svg).toContain('translate(200 100) rotate(90)');
    expect(svg).not.toMatch(
      /<(script|foreignObject)|data-item-id|tabindex|<image|https?:\/\/(?!www.w3.org)/,
    );
    expect(svg).not.toContain('stroke-dasharray');
  });

  it('keeps world geometry independent of camera zoom and limits panning', () => {
    const before = JSON.stringify(document);
    const near = viewBox(document.room, 2, { x: 25, y: 15 });
    const normal = viewBox(document.room, 1, { x: 25, y: 15 });
    expect(near.width * 2).toBe(normal.width);
    expect(near.x + near.width / 2).toBe(345);
    expect(constrainPan({ x: 99999, y: -99999 }, document.room)).toEqual({ x: 320, y: -240 });
    expect(JSON.stringify(document)).toBe(before);
  });
});
