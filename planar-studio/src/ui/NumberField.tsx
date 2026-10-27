import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onCommit(value: number): void;
}
export function NumberField({ label, value, min, max, step = 0.01, unit = 'm', onCommit }: Props) {
  const cancelled = useRef(false);
  const [draft, setDraft] = useState(String(Number(value.toFixed(2))));
  useEffect(() => setDraft(String(Number(value.toFixed(2)))), [value]);
  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      setDraft(String(Number(value.toFixed(2))));
      return;
    }
    const numeric = Number(draft);
    if (draft.trim() && Number.isFinite(numeric)) onCommit(Math.min(max, Math.max(min, numeric)));
    setDraft(String(Number(value.toFixed(2))));
  };
  return (
    <label className="number-field">
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          type="number"
          min={min}
          max={max}
          step={step}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') {
              cancelled.current = true;
              setDraft(String(value));
              event.currentTarget.blur();
            }
          }}
        />
        <small>{unit}</small>
      </div>
    </label>
  );
}
