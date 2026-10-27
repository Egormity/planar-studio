import type { Furniture } from '../model/types';

interface Props {
  item: Furniture;
  shadow?: boolean;
}

export function FurnitureArt({ item, shadow = true }: Props) {
  const { width: w, depth: d, kind, color } = item;
  const x = -w / 2;
  const y = -d / 2;
  const stroke = '#5d655f';
  const radius = Math.min(w, d) * 0.08;
  return (
    <g stroke={stroke} strokeWidth={1.2} strokeLinejoin="round">
      {shadow && kind !== 'rug' && (
        <rect
          x={x + 2}
          y={y + 3}
          width={w}
          height={d}
          rx={radius}
          fill="#36423a"
          opacity="0.12"
          stroke="none"
        />
      )}
      {kind === 'sofa' && (
        <>
          <rect x={x} y={y} width={w} height={d} rx={radius} fill={color} />
          <rect
            x={x + w * 0.07}
            y={y + d * 0.03}
            width={w * 0.86}
            height={d * 0.22}
            rx={d * 0.06}
            fill="#fff"
            fillOpacity="0.12"
          />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={x + w * 0.1 + i * w * 0.267}
              y={y + d * 0.3}
              width={w * 0.255}
              height={d * 0.6}
              rx={d * 0.07}
              fill="#fff"
              fillOpacity="0.18"
            />
          ))}
          <rect
            x={x + w * 0.02}
            y={y + d * 0.16}
            width={w * 0.075}
            height={d * 0.75}
            rx={d * 0.05}
            fill={color}
          />
          <rect
            x={x + w * 0.905}
            y={y + d * 0.16}
            width={w * 0.075}
            height={d * 0.75}
            rx={d * 0.05}
            fill={color}
          />
        </>
      )}
      {kind === 'chair' && (
        <>
          <rect x={x} y={y} width={w} height={d} rx={radius * 1.5} fill={color} />
          <rect
            x={x + w * 0.13}
            y={y + d * 0.24}
            width={w * 0.74}
            height={d * 0.62}
            rx={radius}
            fill="#fff"
            fillOpacity="0.22"
          />
          <path d={`M${x + w * 0.1} ${y + d * 0.2} H${x + w * 0.9}`} fill="none" />
          <path
            d={`M${x + w * 0.08} ${y + d * 0.32} V${y + d * 0.8} M${x + w * 0.92} ${y + d * 0.32} V${y + d * 0.8}`}
            strokeWidth={w * 0.06}
            opacity="0.25"
          />
        </>
      )}
      {kind === 'table' && (
        <>
          <rect x={x} y={y} width={w} height={d} rx={Math.min(w, d) * 0.16} fill={color} />
          <rect
            x={x + 4}
            y={y + 4}
            width={w - 8}
            height={d - 8}
            rx={Math.min(w, d) * 0.13}
            fill="none"
            opacity="0.35"
          />
          <ellipse
            cx={w * 0.13}
            cy={-d * 0.07}
            rx={Math.min(w, d) * 0.15}
            ry={Math.min(w, d) * 0.13}
            fill="#ede8db"
          />
          <circle
            cx={w * 0.13}
            cy={-d * 0.07}
            r={Math.min(w, d) * 0.065}
            fill="#79957b"
            stroke="none"
          />
          <rect
            x={-w * 0.24}
            y={-d * 0.14}
            width={w * 0.19}
            height={d * 0.29}
            rx={1}
            fill="#e9e1ce"
            transform="rotate(-9)"
          />
        </>
      )}
      {kind === 'bed' && (
        <>
          <rect x={x} y={y} width={w} height={d} rx={5} fill={color} />
          <rect x={x + 5} y={y + 9} width={w - 10} height={d - 14} rx={7} fill="#f6f2e9" />
          {[0, 1].map((i) => (
            <rect
              key={i}
              x={x + w * 0.1 + i * w * 0.44}
              y={y + d * 0.09}
              width={w * 0.36}
              height={d * 0.19}
              rx={6}
              fill="#fffaf2"
            />
          ))}
          <rect
            x={x + 5}
            y={y + d * 0.36}
            width={w - 10}
            height={d * 0.6}
            rx={5}
            fill={color}
            fillOpacity="0.8"
          />
          <path d={`M${x + 7} ${y + d * 0.47} H${x + w - 7}`} opacity="0.45" />
          <rect x={x} y={y} width={w} height={10} rx={3} fill="#897964" />
        </>
      )}
      {kind === 'plant' && (
        <>
          <ellipse cx={0} cy={0} rx={w * 0.42} ry={d * 0.42} fill="#d4bba1" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
            <ellipse
              key={angle}
              cx={0}
              cy={-0.22}
              rx={0.13}
              ry={0.27}
              transform={`scale(${w} ${d}) rotate(${angle})`}
              fill={color}
              fillOpacity={index % 2 ? 0.85 : 1}
              stroke="#5e775b"
              strokeWidth={0.8 / Math.max(w, d)}
            />
          ))}
          <circle r={Math.min(w, d) * 0.11} fill="#a8b48b" stroke="none" />
        </>
      )}
      {kind === 'rug' && (
        <>
          <rect
            x={x}
            y={y}
            width={w}
            height={d}
            rx={3}
            fill={color}
            fillOpacity="0.65"
            stroke={color}
            strokeWidth="2"
          />
          <rect
            x={x + w * 0.04}
            y={y + d * 0.05}
            width={w * 0.92}
            height={d * 0.9}
            rx={2}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.55"
            strokeWidth="2"
          />
          {[0.12, 0.2, 0.8, 0.88].map((ratio) => (
            <path
              key={ratio}
              d={`M${x + w * 0.08} ${y + d * ratio} H${x + w * 0.92}`}
              stroke="#fff"
              strokeOpacity="0.22"
            />
          ))}
        </>
      )}
      {kind === 'storage' && (
        <>
          <rect x={x} y={y} width={w} height={d} rx={3} fill={color} />
          {[1, 2].map((i) => (
            <path key={i} d={`M${x + (w * i) / 3} ${y} V${y + d}`} opacity="0.6" />
          ))}
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${x + (w * (i + 0.5)) / 3 - 4} ${y + d * 0.82} h8`}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </>
      )}
    </g>
  );
}
