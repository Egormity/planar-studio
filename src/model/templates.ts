import type { Furniture, PlanTemplate } from './types';

const item = (
  id: string,
  kind: Furniture['kind'],
  label: string,
  x: number,
  y: number,
  width: number,
  depth: number,
  color: string,
  rotation = 0,
): Furniture => ({ id, kind, label, x, y, width, depth, color, rotation });

export const TEMPLATES: readonly PlanTemplate[] = [
  {
    id: 'living-room',
    name: 'The Sunday room',
    description: 'A calm living space · 6.4 × 4.8 m',
    document: {
      version: 1,
      name: 'The Sunday room',
      room: { width: 640, depth: 480, floor: 'oak' },
      items: [
        item('living-rug', 'rug', 'Woven rug', 310, 258, 300, 230, '#e2d3bd'),
        item('living-sofa', 'sofa', 'Linen sofa', 310, 105, 220, 90, '#d8c9b5'),
        item('living-table', 'table', 'Coffee table', 310, 255, 115, 65, '#b8906b'),
        item('living-chair', 'chair', 'Lounge chair', 500, 270, 85, 85, '#afbc9e', 270),
        item('living-storage', 'storage', 'Sideboard', 90, 260, 150, 45, '#bc9875', 90),
        item('living-plant', 'plant', 'Indoor plant', 555, 80, 55, 55, '#7f9b75'),
      ],
    },
  },
  {
    id: 'workspace',
    name: 'A place to create',
    description: 'A thoughtful home office · 5.6 × 4.2 m',
    document: {
      version: 1,
      name: 'A place to create',
      room: { width: 560, depth: 420, floor: 'stone' },
      items: [
        item('office-rug', 'rug', 'Work zone rug', 270, 230, 260, 190, '#e0d8c7'),
        item('office-desk', 'table', 'Studio desk', 270, 120, 160, 75, '#bc9875'),
        item('office-chair', 'chair', 'Desk chair', 270, 225, 70, 70, '#a8b49a', 180),
        item('office-storage', 'storage', 'Low cabinet', 80, 220, 170, 45, '#cfbaa2', 90),
        item('office-reading', 'chair', 'Reading chair', 455, 285, 85, 85, '#d7c4b7', 270),
        item('office-plant', 'plant', 'Fiddle leaf fig', 475, 70, 60, 60, '#7f9b75'),
      ],
    },
  },
];
