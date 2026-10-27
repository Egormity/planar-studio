import { useRef, useState } from 'react';
import { ArrowUpRight, Maximize2, Minus, Plus, X } from 'lucide-react';
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
      <main>
        <div className="workspace-heading">
          <div>
            <div className="eyebrow breadcrumb">
              YOUR WORKSPACE <span>/</span> FLOOR PLAN
            </div>
            <h1>
              Make room for your ideas<span>.</span>
            </h1>
            <p>Move things around. See what feels right.</p>
          </div>
          <div className="area-card">
            <span className="area-mark" aria-hidden="true">
              ⌑
            </span>
            <div>
              <strong>
                {((document.room.width * document.room.depth) / 10_000).toFixed(2)}{' '}
                <small>m²</small>
              </strong>
              <span>YOUR ROOM TO CREATE</span>
            </div>
          </div>
        </div>
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
                <span className="view-tag">
                  TOP VIEW <span>·</span> 2D
                </span>
              </div>
              <div className="canvas-status">
                <div>
                  <span className="plan-dot" />
                  {document.items.length} objects<span className="status-separator">/</span>
                  {snap ? '10 cm snap' : 'Free placement'}
                </div>
                <div className="zoom-controls">
                  <button aria-label="Fit plan" title="Fit plan" onClick={fit}>
                    <Maximize2 size={16} />
                  </button>
                  <span className="tool-divider" />
                  <button
                    aria-label="Zoom out"
                    disabled={zoom <= 0.5}
                    onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
                  >
                    <Minus size={15} />
                  </button>
                  <output aria-label="Zoom level">{Math.round(zoom * 100)}%</output>
                  <button
                    aria-label="Zoom in"
                    disabled={zoom >= 2.5}
                    onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>
            <div className="editor-hints">
              <span>
                <kbd>Drag</kbd> to arrange
              </span>
              <span>
                <kbd>Space</kbd> to pan
              </span>
              <span>
                <kbd>R</kbd> to rotate
              </span>
              <span>
                <kbd>↑↓←→</kbd> to fine-tune
              </span>
              <small>Overlapping pieces are allowed.</small>
            </div>
            <div className="studio-note">
              <span className="note-icon">
                <ArrowUpRight size={23} strokeWidth={1.4} />
              </span>
              <div>
                <strong>A little perspective changes everything.</strong>
                <p>Try a different finish, open up a corner, make a space that feels like you.</p>
              </div>
              <span className="note-rule" />
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
      <footer>
        <span>
          PLANAR STUDIO <i>✳</i> A SPACE FOR POSSIBILITIES
        </span>
        <p>Explore layouts. Keep your ideas.</p>
        <small>Concept plans · not construction drawings</small>
      </footer>
    </div>
  );
}
