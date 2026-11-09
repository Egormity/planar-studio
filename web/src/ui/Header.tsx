import { Download, FileJson, Upload } from 'lucide-react';
interface Props {
  name: string;
  saved: boolean;
  exportJson(): void;
  exportSvg(): void;
  importJson(): void;
  exporting: boolean;
}
export function Header({ name, saved, exportJson, exportSvg, importJson, exporting }: Props) {
  return (
    <header className="site-header">
      <a href="/" className="brand" aria-label="Planar Studio home">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="brand-type">
          <strong>planar</strong>
          <small>studio</small>
        </span>
      </a>
      <div className="document-status">
        <span className="document-name">{name}</span>
        <span className="save-state">
          <i className={saved ? 'saved' : 'unsaved'} />
          {saved ? 'Saved in this browser' : 'Saving unavailable'}
        </span>
      </div>
      <div className="header-actions">
        <button
          className="subtle-button"
          title="Import layout JSON"
          aria-label="Import JSON"
          onClick={importJson}
        >
          <Upload size={17} />
          <span>Open</span>
        </button>
        <button
          className="subtle-button"
          title="Save editable layout"
          aria-label="Export JSON"
          onClick={exportJson}
        >
          <FileJson size={17} />
          <span>Save file</span>
        </button>
        <button
          className="primary-button"
          aria-label="Export SVG"
          disabled={exporting}
          onClick={exportSvg}
        >
          <Download size={17} />
          <span>{exporting ? 'Exporting…' : 'Export plan'}</span>
        </button>
      </div>
    </header>
  );
}
