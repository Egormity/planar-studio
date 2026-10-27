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
        <strong>
          planar<span>.</span>
        </strong>
        <small>
          SPACE
          <br />
          STUDIO
        </small>
      </a>
      <div className="document-status">
        <span>{name}</span>
        <small>
          <i className={saved ? 'saved' : 'unsaved'} />
          {saved ? 'Saved on this device' : 'Export to keep a copy'}
        </small>
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
