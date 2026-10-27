import { Grid2X2, Hand, Magnet, MousePointer2, Redo2, Ruler, Undo2 } from 'lucide-react';
interface Props {
  panMode: boolean;
  setPanMode(value: boolean): void;
  grid: boolean;
  setGrid(value: boolean): void;
  snap: boolean;
  setSnap(value: boolean): void;
  dimensions: boolean;
  setDimensions(value: boolean): void;
  undo(): void;
  redo(): void;
  canUndo: boolean;
  canRedo: boolean;
}
export function ViewportToolbar({
  panMode,
  setPanMode,
  grid,
  setGrid,
  snap,
  setSnap,
  dimensions,
  setDimensions,
  undo,
  redo,
  canUndo,
  canRedo,
}: Props) {
  return (
    <div className="viewport-toolbar">
      <div className="tool-cluster">
        <div className="tool-segment">
          <button
            type="button"
            aria-label="Select objects"
            title="Select objects"
            aria-pressed={!panMode}
            onClick={() => setPanMode(false)}
          >
            <MousePointer2 size={17} />
          </button>
          <button
            type="button"
            aria-label="Pan view"
            title="Pan view (or hold Space)"
            aria-pressed={panMode}
            onClick={() => setPanMode(true)}
          >
            <Hand size={17} />
          </button>
        </div>
        <span className="tool-divider" />
        <button
          className="tool-with-label"
          aria-label="Show grid"
          aria-pressed={grid}
          onClick={() => setGrid(!grid)}
        >
          <Grid2X2 size={16} />
          <span>Grid</span>
        </button>
        <button
          className="tool-with-label"
          aria-label="Snap to 10 cm"
          aria-pressed={snap}
          onClick={() => setSnap(!snap)}
        >
          <Magnet size={16} />
          <span>Snap</span>
        </button>
        <button
          className="tool-with-label"
          aria-label="Show dimensions"
          aria-pressed={dimensions}
          onClick={() => setDimensions(!dimensions)}
        >
          <Ruler size={16} />
          <span>Dimensions</span>
        </button>
      </div>
      <div className="tool-cluster history-tools">
        <button aria-label="Undo" title="Undo (Ctrl/Cmd+Z)" disabled={!canUndo} onClick={undo}>
          <Undo2 size={18} />
        </button>
        <button
          aria-label="Redo"
          title="Redo (Ctrl/Cmd+Shift+Z)"
          disabled={!canRedo}
          onClick={redo}
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );
}
