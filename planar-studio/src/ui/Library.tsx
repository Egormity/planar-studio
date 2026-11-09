import { ArrowUpRight, Plus } from 'lucide-react';
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
      <div className="panel-heading">
        <div>
          <h2>Furniture</h2>
          <p>Click a piece to add it.</p>
        </div>
        <span className="count-pill">{count}/60</span>
      </div>
      <div className="catalog-list">
        {CATALOG.map((item) => (
          <button
            key={item.kind}
            className={`catalog-item catalog-${item.kind}`}
            aria-label={`Add ${item.label}`}
            disabled={count >= 60}
            onClick={() => add(item.kind)}
          >
            <span className="catalog-art">
              <FurnitureIcon kind={item.kind} size={26} />
            </span>
            <span className="catalog-copy">
              <strong>{item.label}</strong>
              <small>
                {(item.width / 100).toFixed(1)} × {(item.depth / 100).toFixed(1)} m
              </small>
            </span>
            <span className="catalog-add" aria-hidden="true">
              <Plus size={15} />
            </span>
          </button>
        ))}
      </div>
      <div className="templates">
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
            <span className="template-copy">
              <strong>{template.name}</strong>
              <small>{template.description}</small>
            </span>
            <ArrowUpRight size={16} />
          </button>
        ))}
      </div>
    </aside>
  );
}
