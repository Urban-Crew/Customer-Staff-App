import Svg, { Path } from 'react-native-svg';

export interface LongArrowProps {
  direction?: 'left' | 'right';
  color: string;
  size?: number;
}

// Long shaft, small head — nearly edge-to-edge in the 24x24 box.
const LEFT_PATH = 'M22 12H2M2 12L6 8M2 12L6 16';
const RIGHT_PATH = 'M2 12H22M22 12L18 8M22 12L18 16';

/** The long-tailed arrow glyph used for back/forward affordances app-wide. */
export function LongArrow({ direction = 'left', color, size = 24 }: LongArrowProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={direction === 'left' ? LEFT_PATH : RIGHT_PATH}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
