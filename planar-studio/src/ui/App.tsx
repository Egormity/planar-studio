import { useRef, useState } from 'react';
import { Maximize2, Minus, Plus, X } from 'lucide-react';
import { usePlanner } from '../editor/usePlanner';
import { serializeDocument } from '../model/serialization';
import { PlanCanvas } from '../scene/PlanCanvas';
import { Header } from './Header';
import { Inspector } from './Inspector';
import { Library } from './Library';
import { ViewportToolbar } from './ViewportToolbar';
import { downloadFile, fileStem } from './download';
import { editorKeyHandler } from './useEditorKeys';

export function App() {
  const planner = usePlanner();
  const [grid, setGrid] = useState(true);
  const [snap, setSnap] = useState(true);
  const [dimensions, setDimensions] = useState(true);
  const [panMode, setPanMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fitToken, setFitToken] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const { document } = planner;
  const area = ((document.room.width * document.room.depth) / 10_000).toFixed(2);
  const fit = () => {
    setZoom(1);
    setFitToken((value) => value + 1);
  };
  const exportSvg = async () => {
    setExporting(true);
    setFileError(null);
    try {
      const { exportSvg } = await import('../scene/exportSvg');
      downloadFile(
        await exportSvg(document, { showDimensions: dimensions }),
        'image/svg+xml',
        `${fileStem(document.name)}.svg`,
      );
    } catch {
      setFileError('The plan could not be exported. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="app-shell" onKeyDown={editorKeyHandler(planner)}>
      <Header
        name={document.name}
        saved={planner.saveStatus === 'saved'}
        exportJson={() =>
          downloadFile(
            serializeDocument(document),
            'application/json',
            `${fileStem(document.name)}.json`,
          )
        }
        exportSvg={() => void exportSvg()}
        importJson={() => importRef.current?.click()}
        exporting={exporting}
      />
      <input
        className="visually-hidden"
        ref={importRef}
        type="file"
        accept=".json,application/json"
        aria-label="Import layout file"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          setFileError(null);
          if (file.size > 1_000_000) {
            setFileError('Choose a layout file smaller than 1 MB.');
            return;
          }
          try {
            if (planner.importJson(await file.text())) fit();
          } catch {
            setFileError('This file could not be read.');
          }
        }}
      />
      <main className="workspace">
        {(planner.error || fileError) && (
          <div className="notice" role="alert">
            <span>{fileError || planner.error}</span>
            <button
              aria-label="Dismiss message"
              onClick={() => {
                setFileError(null);
                planner.clearError();
              }}
            >
              <X size={17} />
            </button>
          </div>
        )}
        <div className="workspace-grid">
          <Library
            add={planner.addItem}
            count={document.items.length}
            loadTemplate={(id) => {
              planner.loadTemplate(id);
              fit();
            }}
          />
          <section className="workspace-center" aria-label="Plan editor">
            <div className="drawing-card">
              <ViewportToolbar
                panMode={panMode}
                setPanMode={setPanMode}
                grid={grid}
                setGrid={setGrid}
                snap={snap}
                setSnap={setSnap}
                dimensions={dimensions}
                setDimensions={setDimensions}
                undo={planner.undo}
                redo={planner.redo}
                canUndo={planner.canUndo}
                canRedo={planner.canRedo}
              />
              <div className="plan-viewport">
                <PlanCanvas
                  document={document}
                  selectedId={planner.selectedId}
                  onSelect={planner.select}
                  onChangeItem={planner.updateItem}
                  snap={snap}
                  showGrid={grid}
                  showDimensions={dimensions}
                  panMode={panMode}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  fitToken={fitToken}
                  svgRef={svgRef}
                />
                <div className="canvas-zoom" role="group" aria-label="Zoom controls">
                  <button
                    aria-label="Zoom out"
                    disabled={zoom <= 0.5}
                    onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
                  >
                    <Minus size={16} />
                  </button>
                  <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
                  <button
                    aria-label="Zoom in"
                    disabled={zoom >= 2.5}
                    onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))}
                  >
                    <Plus size={16} />
                  </button>
                  <span className="zoom-divider" aria-hidden="true" />
                  <button aria-label="Fit plan" title="Fit plan" onClick={fit}>
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>
          <Inspector
            document={document}
            item={planner.selectedItem}
            selectedId={planner.selectedId}
            select={planner.select}
            updateItem={planner.updateItem}
            updateRoom={planner.updateRoom}
            duplicate={planner.duplicateSelected}
            remove={planner.removeSelected}
            rotate={() => planner.rotateSelected(90)}
          />
        </div>
      </main>
      <footer className="site-footer">
        <div className="workspace-heading">
          <div className="footer-intro">
            <span className="footer-eyebrow">Planar Studio</span>
            <h1>
              Make room for your ideas<span>.</span>
            </h1>
            <p>Move things around. See what feels right.</p>
          </div>
          <div className="area-card" aria-label={`Room area: ${area} square metres`}>
            <div>
              <strong>
                {area}
                <small>m²</small>
              </strong>
              <span>Room area</span>
            </div>
          </div>
        </div>
        <div className="footer-meta">
          <span>Planar Studio — a space for possibilities</span>
          <small>Concept plans, not construction drawings</small>
        </div>
      </footer>
    </div>
  );
}
