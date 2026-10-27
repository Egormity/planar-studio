import { Archive, Armchair, BedDouble, Flower2, Sofa, Square, Table2 } from 'lucide-react';
import type { FurnitureKind } from '../model/types';
const icons = {
  sofa: Sofa,
  chair: Armchair,
  table: Table2,
  bed: BedDouble,
  plant: Flower2,
  rug: Square,
  storage: Archive,
};
export function FurnitureIcon({ kind, size = 28 }: { kind: FurnitureKind; size?: number }) {
  const Icon = icons[kind];
  return <Icon size={size} strokeWidth={1.35} aria-hidden="true" />;
}
