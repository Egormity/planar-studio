import type { KeyboardEvent } from 'react';
import type { Furniture } from '../model/types';
interface Actions {
  selectedItem?: Furniture;
  updateItem(id: string, patch: Partial<Furniture>): void;
  select(id: string | null): void;
  undo(): void;
  redo(): void;
  removeSelected(): void;
  duplicateSelected(): void;
  rotateSelected(degrees?: number): void;
}
export function editorKeyHandler(actions: Actions) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.defaultPrevented ||
      (event.target instanceof Element &&
        event.target.closest('input,textarea,select,[contenteditable="true"]'))
    )
      return;
    const modified = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();
    if (modified && key === 'z') {
      event.preventDefault();
      if (event.shiftKey) actions.redo();
      else actions.undo();
      return;
    }
    if (modified && key === 'd') {
      event.preventDefault();
      actions.duplicateSelected();
      return;
    }
    if (modified) return;
    if (key === 'escape') {
      actions.select(null);
      return;
    }
    if (!actions.selectedItem) return;
    if (key === 'delete' || key === 'backspace') {
      event.preventDefault();
      actions.removeSelected();
    }
    if (key === 'r') {
      event.preventDefault();
      actions.rotateSelected(90);
    }
    const movement: Record<string, [number, number]> = {
      arrowleft: [-1, 0],
      arrowright: [1, 0],
      arrowup: [0, -1],
      arrowdown: [0, 1],
    };
    if (movement[key]) {
      event.preventDefault();
      const [x, y] = movement[key];
      const step = event.shiftKey ? 10 : 1;
      actions.updateItem(actions.selectedItem.id, {
        x: actions.selectedItem.x + x * step,
        y: actions.selectedItem.y + y * step,
      });
    }
  };
}
