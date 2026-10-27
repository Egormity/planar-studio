import { useId } from 'react';
import type { PlanCanvasProps } from './contracts';
import { FurnitureArt } from './FurnitureArt';
import { RoomArt } from './RoomArt';
import { usePlanGestures } from './usePlanGestures';
import { viewBox } from './viewport';

export function PlanCanvas(props: PlanCanvasProps) {
  const gestures = usePlanGestures(props);
  const prefix = `plan-${useId().replace(/:/g, '')}`;
  const box = viewBox(props.document.room, props.zoom, gestures.pan);
  return (
    <svg
      ref={props.svgRef}
      className="plan-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
      preserveAspectRatio="xMidYMid meet"
      role="application"
      aria-label="2D floor plan"
      aria-describedby="plan-interaction-help"
      tabIndex={0}
      data-testid="plan-canvas"
      data-zoom={props.zoom}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        touchAction: 'none',
        userSelect: 'none',
        cursor: props.panMode || gestures.spaceHeld ? 'grab' : 'default',
        background: '#f5f6f1',
      }}
      onPointerDown={gestures.pointerDown}
      onPointerMove={gestures.pointerMove}
      onPointerUp={gestures.pointerUp}
      onPointerCancel={gestures.cancelPointer}
      onLostPointerCapture={gestures.cancelPointer}
      onContextMenu={(event) => event.preventDefault()}
      onBlur={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          gestures.cancel();
      }}
    >
      <desc id="plan-interaction-help">
        Select furniture to edit it. Drag to move. Use the Pan tool or hold Space and drag to pan.
        Control or Command plus the wheel zooms. Escape cancels a drag.
      </desc>
      <RoomArt
        room={props.document.room}
        prefix={prefix}
        showGrid={props.showGrid}
        showDimensions={props.showDimensions}
      />
      {props.document.items.map((stored) => {
        const item = gestures.preview?.id === stored.id ? gestures.preview : stored;
        const selected = item.id === props.selectedId;
        return (
          <g
            key={item.id}
            transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`}
            data-item-id={item.id}
            data-testid={`item-${item.id}`}
            data-x={item.x}
            data-y={item.y}
            data-rotation={item.rotation}
            role="button"
            aria-label={`Select ${item.label}`}
            aria-pressed={selected}
            tabIndex={0}
            style={{ cursor: props.panMode || gestures.spaceHeld ? 'grab' : 'move' }}
            onFocus={() => props.onSelect(item.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                props.onSelect(item.id);
              }
            }}
          >
            <title>{`${item.label} · ${(item.width / 100).toFixed(2)} × ${(item.depth / 100).toFixed(2)} m`}</title>
            <FurnitureArt item={item} />
            {selected && (
              <g pointerEvents="none">
                <rect
                  x={-item.width / 2 - 6}
                  y={-item.depth / 2 - 6}
                  width={item.width + 12}
                  height={item.depth + 12}
                  rx="5"
                  fill="none"
                  stroke="#406d63"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="5 3"
                />
                <rect
                  x="-45"
                  y={item.depth / 2 + 10}
                  width="90"
                  height="17"
                  rx="4"
                  fill="#406d63"
                />
                <text
                  y={item.depth / 2 + 22}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="9"
                  fontFamily="Arial, sans-serif"
                >
                  {(item.width / 100).toFixed(2)} × {(item.depth / 100).toFixed(2)} m
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
