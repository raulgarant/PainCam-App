import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

const RightIcon = ({ fill = '#000000', width = 55, height = 55 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 1280 640">
      <G transform="translate(0, 640) scale(0.1, -0.1)">
        <Path
          fill={fill}
          d="M9079 6154 l-24 -26 -3 -694 -2 -694 -4481 0 c-4886 0 -4536 4 -4559 -55 -13 -35 -14 -2934 0 -2969 5 -14 23 -32 39 -41 27 -13 486 -15 4515 -15 l4486 0 2 -694 3 -694 24 -26 c29 -31 84 -35 121 -9 14 10 747 609 1630 1332 883 723 1680 1376 1772 1450 91 75 174 150 183 167 19 32 16 65 -8 95 -11 15 -3526 2846 -3577 2882 -37 26 -92 22 -121 -9z"
        />
      </G>
    </Svg>
  );
};

export default RightIcon;