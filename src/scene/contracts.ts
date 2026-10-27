import type { RefObject } from 'react';
import type { Furniture, PlanDocument } from '../model/types';
export interface PlanCanvasProps {
  document: PlanDocument;
  selectedId: string | null;
  onSelect(id: string | null): void;
  onChangeItem(id: string, patch: Partial<Furniture>): void;
  snap: boolean;
  showGrid: boolean;
  showDimensions: boolean;
  panMode: boolean;
  zoom: number;
  onZoomChange(value: number): void;
  fitToken: number;
  svgRef: RefObject<SVGSVGElement | null>;
}
