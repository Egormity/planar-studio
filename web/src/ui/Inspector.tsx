import { Copy, MousePointer2, RotateCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Furniture, PlanDocument, Room } from '../model/types';
import { FurnitureIcon } from './FurnitureIcon';
import { NumberField } from './NumberField';
interface Props {
  document: PlanDocument;
  item?: Furniture;
  selectedId: string | null;
  select(id: string): void;
  updateItem(id: string, patch: Partial<Furniture>): void;
  updateRoom(patch: Partial<Room>): void;
  duplicate(): void;
  remove(): void;
  rotate(): void;
}
const colors = ['#a7b6a0', '#d0b299', '#b8c8d1', '#d8cdb8', '#bd9390', '#6f7b72'];
function ObjectName({ item, onCommit }: { item: Furniture; onCommit(name: string): void }) {
  const [name, setName] = useState(item.label);
  useEffect(() => setName(item.label), [item.label, item.id]);
  return (
    <label className="text-field">
      <span>Name</span>
      <input
        aria-label="Object name"
        value={name}
        maxLength={64}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim()) onCommit(name.trim());
          else setName(item.label);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
      />
    </label>
  );
}
export function Inspector({
  document,
  item,
  selectedId,
  select,
  updateItem,
  updateRoom,
  duplicate,
  remove,
  rotate,
}: Props) {
  return (
    <aside className="inspector-panel panel" aria-label="Properties">
      <div className="panel-heading">
        <div>
          <h2>{item ? 'Piece details' : 'Room details'}</h2>
          <p>
            {item ? 'Size, position and finish.' : 'Pick a piece to edit it, or adjust the room.'}
          </p>
        </div>
      </div>
      {item ? (
        <div className="object-properties" key={item.id}>
          <div className="selected-object">
            <span style={{ background: item.color }}>
              <FurnitureIcon kind={item.kind} />
            </span>
            <div>
              <strong>{item.label}</strong>
              <small>
                {(item.width / 100).toFixed(1)} × {(item.depth / 100).toFixed(1)} m
              </small>
            </div>
          </div>
          <ObjectName item={item} onCommit={(label) => updateItem(item.id, { label })} />
          <div className="section-label">Size and position</div>
          <div className="field-grid">
            <NumberField
              label="Object width"
              value={item.width / 100}
              min={0.2}
              max={6}
              onCommit={(width) => updateItem(item.id, { width: width * 100 })}
            />
            <NumberField
              label="Object depth"
              value={item.depth / 100}
              min={0.2}
              max={6}
              onCommit={(depth) => updateItem(item.id, { depth: depth * 100 })}
            />
            <NumberField
              label="X position"
              value={item.x / 100}
              min={0}
              max={document.room.width / 100}
              onCommit={(x) => updateItem(item.id, { x: x * 100 })}
            />
            <NumberField
              label="Y position"
              value={item.y / 100}
              min={0}
              max={document.room.depth / 100}
              onCommit={(y) => updateItem(item.id, { y: y * 100 })}
            />
          </div>
          <NumberField
            label="Rotation"
            value={item.rotation}
            min={0}
            max={359}
            step={15}
            unit="°"
            onCommit={(rotation) => updateItem(item.id, { rotation })}
          />
          <div className="color-picker">
            <span>Finish</span>
            <div>
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  style={{ background: color }}
                  className={item.color === color ? 'active' : ''}
                  aria-label={`Use color ${color}`}
                  aria-pressed={item.color === color}
                  onClick={() => updateItem(item.id, { color })}
                />
              ))}
            </div>
          </div>
          <div className="object-actions">
            <button title="Rotate 90°" aria-label="Rotate object" onClick={rotate}>
              <RotateCw size={16} />
              <span>Rotate</span>
            </button>
            <button
              title="Duplicate"
              aria-label="Duplicate object"
              onClick={duplicate}
              disabled={document.items.length >= 60}
            >
              <Copy size={16} />
              <span>Duplicate</span>
            </button>
            <button title="Delete" aria-label="Delete object" onClick={remove}>
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="selection-hint">
          <span className="selection-icon" aria-hidden="true">
            <MousePointer2 size={19} />
          </span>
          <div>
            <strong>No piece selected</strong>
            <p>Click any piece on the plan to change its size, position and finish.</p>
          </div>
        </div>
      )}
      <section className="room-properties" aria-label="Room settings">
        <div className="section-label">Room size</div>
        <div className="field-grid">
          <NumberField
            label="Room width"
            value={document.room.width / 100}
            min={2}
            max={16}
            onCommit={(width) => updateRoom({ width: width * 100 })}
          />
          <NumberField
            label="Room depth"
            value={document.room.depth / 100}
            min={2}
            max={16}
            onCommit={(depth) => updateRoom({ depth: depth * 100 })}
          />
        </div>
        <span className="floor-heading">Floor finish</span>
        <div className="floor-options" role="group" aria-label="Floor finish">
          {(['oak', 'stone', 'plain'] as const).map((floor) => (
            <button
              key={floor}
              className={`floor-option floor-${floor}`}
              aria-label={`${floor} floor`}
              aria-pressed={document.room.floor === floor}
              onClick={() => updateRoom({ floor })}
            >
              <span />
              <small>{floor}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="objects-list" aria-label="Objects in this plan">
        <div className="section-label">
          Pieces<span>{document.items.length}</span>
        </div>
        {document.items.map((entry) => (
          <button
            key={entry.id}
            className={entry.id === selectedId ? 'selected' : ''}
            aria-label={`Select ${entry.label} from list`}
            aria-pressed={entry.id === selectedId}
            onClick={() => select(entry.id)}
          >
            <FurnitureIcon kind={entry.kind} size={17} />
            <span>{entry.label}</span>
            <small>{(entry.width / 100).toFixed(1)} m</small>
          </button>
        ))}
      </section>
    </aside>
  );
}
