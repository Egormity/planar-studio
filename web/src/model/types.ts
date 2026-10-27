export type FurnitureKind = 'sofa' | 'chair' | 'table' | 'bed' | 'plant' | 'rug' | 'storage';
export type FloorMaterial = 'oak' | 'stone' | 'plain';
export interface Room {
  width: number;
  depth: number;
  floor: FloorMaterial;
}
export interface Furniture {
  id: string;
  kind: FurnitureKind;
  label: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  rotation: number;
  color: string;
}
export interface PlanDocument {
  version: 1;
  name: string;
  room: Room;
  items: Furniture[];
}
export interface CatalogEntry {
  kind: FurnitureKind;
  label: string;
  width: number;
  depth: number;
  color: string;
  description: string;
}
export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  document: PlanDocument;
}
