import type { Room } from '../model/types';

interface Props {
  room: Room;
  prefix: string;
  showGrid: boolean;
  showDimensions: boolean;
}

export function RoomArt({ room, prefix, showGrid, showDimensions }: Props) {
  const { width: w, depth: d, floor } = room;
  const fill = floor === 'oak' ? '#e8dfce' : floor === 'stone' ? '#e5e6e1' : '#f5f3ed';
  return (
    <g>
      <defs>
        <pattern
          id={`${prefix}-floor`}
          width={floor === 'oak' ? 28 : 60}
          height={floor === 'oak' ? 160 : 60}
          patternUnits="userSpaceOnUse"
        >
          <rect width="100%" height="100%" fill={fill} />
          {floor === 'oak' && (
            <>
              <path
                d="M0 0 V160 M28 0 V160 M0 80 H28"
                stroke="#c5b79e"
                strokeWidth="0.7"
                opacity="0.5"
              />
              <path d="M7 9 V64 M19 101 V150" stroke="#fff" strokeWidth="0.8" opacity="0.3" />
            </>
          )}
          {floor === 'stone' && (
            <path d="M0 0 H60 V60" fill="none" stroke="#c4c9c3" strokeWidth="1" />
          )}
        </pattern>
        <pattern id={`${prefix}-grid`} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="0.5" cy="0.5" r="0.7" fill="#6a7b70" opacity="0.25" />
        </pattern>
      </defs>
      <rect x="5" y="7" width={w} height={d} fill="#263b30" opacity="0.08" />
      <rect width={w} height={d} fill={`url(#${prefix}-floor)`} />
      {showGrid && <rect width={w} height={d} fill={`url(#${prefix}-grid)`} pointerEvents="none" />}
      <rect width={w} height={d} fill="none" stroke="#4c5750" strokeWidth="9" />
      {/* Architectural openings are illustrative; the model stores one rectangular room. */}
      <path d={`M${w * 0.28} 0 H${w * 0.7}`} stroke="#f4f6f2" strokeWidth="10" />
      <path
        d={`M${w * 0.28} -3 H${w * 0.7} M${w * 0.28} 3 H${w * 0.7} M${w * 0.49} -3 V3`}
        stroke="#8eaaa9"
        strokeWidth="1.5"
      />
      <path d={`M${w} ${d * 0.24} V${d * 0.62}`} stroke="#f4f6f2" strokeWidth="10" />
      <path
        d={`M${w - 3} ${d * 0.24} V${d * 0.62} M${w + 3} ${d * 0.24} V${d * 0.62}`}
        stroke="#8eaaa9"
        strokeWidth="1.5"
      />
      {showDimensions && <Dimensions room={room} />}
    </g>
  );
}

function Dimensions({ room: { width: w, depth: d } }: { room: Room }) {
  return (
    <g
      fill="#738177"
      stroke="#9ca79e"
      strokeWidth="0.8"
      fontFamily="Arial, sans-serif"
      fontSize="11"
      fontWeight="500"
      pointerEvents="none"
    >
      <path d={`M0 -17 V-42 M${w} -17 V-42 M0 -34 H${w}`} fill="none" />
      <path d={`M-3 -31 L3 -37 M${w - 3} -31 L${w + 3} -37`} strokeWidth="1.4" />
      <rect x={w / 2 - 31} y="-42" width="62" height="16" fill="#f5f6f1" stroke="none" />
      <text x={w / 2} y="-30" textAnchor="middle" stroke="none">
        {(w / 100).toFixed(2)} m
      </text>
      <path d={`M-17 0 H-42 M-17 ${d} H-42 M-34 0 V${d}`} fill="none" />
      <path d={`M-37 3 L-31 -3 M-37 ${d + 3} L-31 ${d - 3}`} strokeWidth="1.4" />
      <g transform={`translate(-34 ${d / 2}) rotate(-90)`}>
        <rect x="-31" y="-8" width="62" height="16" fill="#f5f6f1" stroke="none" />
        <text y="4" textAnchor="middle" stroke="none">
          {(d / 100).toFixed(2)} m
        </text>
      </g>
    </g>
  );
}
