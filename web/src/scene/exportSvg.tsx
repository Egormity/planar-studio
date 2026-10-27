import type { PlanDocument } from '../model/types';
import { FurnitureArt } from './FurnitureArt';
import { RoomArt } from './RoomArt';
import { viewBox } from './viewport';

/** Serialize the document presentation, independent of selection and editor camera. */
export async function exportSvg(
  document: PlanDocument,
  options: { showDimensions?: boolean } = {},
): Promise<string> {
  // Lazy-load the static serializer so editing does not pay for the export-only chunk.
  const { renderToStaticMarkup } = await import('react-dom/server');
  const box = viewBox(document.room, 1, { x: 0, y: 0 });
  const markup = renderToStaticMarkup(
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={box.width}
      height={box.height}
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
    >
      <title>{document.name}</title>
      <desc>
        Planar Studio furniture layout. Measurements are centimetres in the document and metres on
        dimension labels.
      </desc>
      <rect x={box.x} y={box.y} width={box.width} height={box.height} fill="#f5f6f1" />
      <RoomArt
        room={document.room}
        prefix="plan-export"
        showGrid={false}
        showDimensions={options.showDimensions ?? true}
      />
      {document.items.map((item) => (
        <g key={item.id} transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`}>
          <title>{item.label}</title>
          <FurnitureArt item={item} />
        </g>
      ))}
    </svg>,
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}`;
}
