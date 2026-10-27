import { ArrowUpRight, Layers, Plus } from 'lucide-react';
import { CATALOG } from '../model/catalog';
import { TEMPLATES } from '../model/templates';
import type { FurnitureKind } from '../model/types';
import { FurnitureIcon } from './FurnitureIcon';
interface Props {
  add(kind: FurnitureKind): void;
  loadTemplate(id: string): void;
  count: number;
}
export function Library({ add, loadTemplate, count }: Props) {
  return (
    <aside className="library-panel panel" aria-label="Object library">
      <div className="panel-title">
        <span className="eyebrow">THE BUILDING BLOCKS</span>
        <h2>
          Object library <Layers size={18} />
        </h2>
        <p>A few good pieces. Endless possibilities.</p>
      </div>
      <div className="catalog-grid">
        {CATALOG.map((item) => (
          <button
            key={item.kind}
            className={`catalog-item catalog-${item.kind}`}
            aria-label={`Add ${item.label}`}
            disabled={count >= 60}
            onClick={() => add(item.kind)}
          >
            <span className="catalog-art">
              <FurnitureIcon kind={item.kind} size={35} />
              <Plus className="catalog-plus" size={13} />
            </span>
            <strong>{item.label}</strong>
            <small>
              {(item.width / 100).toFixed(1)} × {(item.depth / 100).toFixed(1)} m
            </small>
          </button>
        ))}
      </div>
      <div className="library-note">
        Click a piece to add it to your plan.<span>{count} / 60 pieces in this space</span>
      </div>
      <div className="templates">
        <span className="eyebrow">A PLACE TO BEGIN</span>
        <h3>Start with a layout</h3>
        {TEMPLATES.map((template, i) => (
          <button
            type="button"
            className="template-button"
            key={template.id}
            aria-label={`Load ${template.name}`}
            onClick={() => loadTemplate(template.id)}
          >
            <span className={`template-map template-map-${i}`} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>
              <strong>{template.name}</strong>
              <small>{template.description}</small>
            </span>
            <ArrowUpRight size={15} />
          </button>
        ))}
        <p>You can undo a layout change.</p>
      </div>
    </aside>
  );
}
