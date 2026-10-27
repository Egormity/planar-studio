import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { constrainItem, snapPosition } from '../model/geometry';
import type { Furniture } from '../model/types';
import type { PlanCanvasProps } from './contracts';
import { constrainPan, worldPoint, type Point } from './viewport';

type Gesture = {
  pointerId: number;
  inverse: DOMMatrix;
  start: Point;
  startClient: Point;
  moved: boolean;
  pan: Point;
  item: Furniture | null;
};

export function usePlanGestures(props: PlanCanvasProps) {
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [preview, setPreview] = useState<Furniture | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const active = useRef<Gesture | null>(null);
  const previewRef = useRef<Furniture | null>(null);
  const spaceRef = useRef(false);
  const latest = useRef({ props, pan });
  latest.current = { props, pan };

  function release(gesture: Gesture) {
    const svg = latest.current.props.svgRef.current;
    if (svg?.hasPointerCapture(gesture.pointerId)) svg.releasePointerCapture(gesture.pointerId);
  }

  function cancel(update = true) {
    const gesture = active.current;
    active.current = null;
    previewRef.current = null;
    if (gesture) release(gesture);
    if (!update) return;
    setPreview(null);
    if (gesture && !gesture.item) setPan(gesture.pan);
  }

  function pointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.button !== 0 && event.button !== 1) return;
    if (active.current) {
      if (event.pointerId !== active.current.pointerId) cancel();
      return;
    }
    const { props: current, pan: currentPan } = latest.current;
    const svg = current.svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return;
    const start = worldPoint(svg, event.clientX, event.clientY);
    if (!start) return;
    event.preventDefault();
    svg.focus({ preventScroll: true });
    const panGesture = current.panMode || spaceRef.current || event.button === 1;
    const id =
      event.target instanceof Element
        ? event.target.closest('[data-item-id]')?.getAttribute('data-item-id')
        : null;
    const item = !panGesture
      ? current.document.items.find((candidate) => candidate.id === id)
      : undefined;
    if (!panGesture) current.onSelect(item?.id ?? null);
    if (!panGesture && !item) return;
    active.current = {
      pointerId: event.pointerId,
      inverse: matrix.inverse(),
      start,
      startClient: { x: event.clientX, y: event.clientY },
      moved: false,
      pan: currentPan,
      item: item ?? null,
    };
    try {
      svg.setPointerCapture(event.pointerId);
    } catch {
      cancel();
    }
  }

  function pointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const gesture = active.current;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    event.preventDefault();
    if (
      !gesture.moved &&
      Math.hypot(event.clientX - gesture.startClient.x, event.clientY - gesture.startClient.y) < 3
    )
      return;
    gesture.moved = true;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(gesture.inverse);
    const dx = point.x - gesture.start.x;
    const dy = point.y - gesture.start.y;
    const { props: current } = latest.current;
    if (!gesture.item) {
      setPan(constrainPan({ x: gesture.pan.x - dx, y: gesture.pan.y - dy }, current.document.room));
      return;
    }
    const x = gesture.item.x + dx;
    const y = gesture.item.y + dy;
    const next = constrainItem(
      {
        ...gesture.item,
        x: current.snap ? snapPosition(x) : x,
        y: current.snap ? snapPosition(y) : y,
      },
      current.document.room,
    );
    previewRef.current = next;
    setPreview(next);
  }

  function pointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    const gesture = active.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    pointerMove(event);
    const next = previewRef.current;
    active.current = null;
    previewRef.current = null;
    setPreview(null);
    release(gesture);
    if (
      gesture.item &&
      next &&
      (Math.abs(next.x - gesture.item.x) > 0.001 || Math.abs(next.y - gesture.item.y) > 0.001)
    ) {
      latest.current.props.onChangeItem(gesture.item.id, { x: next.x, y: next.y });
    }
  }

  useEffect(() => {
    // A document command supersedes any uncommitted pointer preview.
    cancel();
  }, [props.document, props.zoom]);

  useEffect(() => {
    cancel();
    setPan({ x: 0, y: 0 });
  }, [props.fitToken]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const svg = latest.current.props.svgRef.current;
      if (event.key === 'Escape' && active.current) {
        event.preventDefault();
        event.stopPropagation();
        cancel();
      }
      if (event.code === 'Space' && svg?.contains(document.activeElement)) {
        event.preventDefault();
        spaceRef.current = true;
        setSpaceHeld(true);
      }
    };
    const keyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        spaceRef.current = false;
        setSpaceHeld(false);
      }
    };
    const loseFocus = () => {
      spaceRef.current = false;
      setSpaceHeld(false);
      cancel();
    };
    const visibility = () => {
      if (document.hidden) loseFocus();
    };
    window.addEventListener('keydown', keyDown, true);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', loseFocus);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('keydown', keyDown, true);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', loseFocus);
      document.removeEventListener('visibilitychange', visibility);
      cancel(false);
    };
  }, []);

  useEffect(() => {
    const svg = props.svgRef.current;
    if (!svg) return;
    // Pointer deltas use the matrix captured at gesture start; a resized view invalidates it.
    const observer = new ResizeObserver(() => {
      if (active.current) cancel();
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [props.svgRef]);

  useEffect(() => {
    const svg = props.svgRef.current;
    if (!svg) return;
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      cancel();
      const { props: current, pan: currentPan } = latest.current;
      const nextZoom = Math.max(
        0.5,
        Math.min(2.5, current.zoom * (event.deltaY < 0 ? 1.12 : 1 / 1.12)),
      );
      const anchor = worldPoint(svg, event.clientX, event.clientY);
      if (anchor) {
        const ratio = current.zoom / nextZoom;
        const center = { x: current.document.room.width / 2, y: current.document.room.depth / 2 };
        setPan(
          constrainPan(
            {
              x: anchor.x + (center.x + currentPan.x - anchor.x) * ratio - center.x,
              y: anchor.y + (center.y + currentPan.y - anchor.y) * ratio - center.y,
            },
            current.document.room,
          ),
        );
      }
      current.onZoomChange(nextZoom);
    };
    svg.addEventListener('wheel', wheel, { passive: false });
    return () => svg.removeEventListener('wheel', wheel);
  }, [props.svgRef]);

  return {
    pan,
    preview,
    spaceHeld,
    pointerDown,
    pointerMove,
    pointerUp,
    cancelPointer: (event: ReactPointerEvent<SVGSVGElement>) => {
      if (event.pointerId === active.current?.pointerId) cancel();
    },
    cancel,
  };
}
