import React from 'react';
import Svg, { Path } from 'react-native-svg';

const HandCentralIcon = ({ fill = '#000000', width = 55, height = 55 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 407 333">
      {/* Silueta principal de la zona central de la palma */}
      <Path
        fill={fill}
        d="M 58 0 L 115 0 L 115 40.5 L 117.5 44 L 124.5 46 L 130 42.5 L 132 37.5 L 132 0 L 191 0 L 191 40.5 L 193 44 L 199.5 46 L 207 40.5 L 207 0 L 264 0 L 264 60.5 L 268.5 66 L 273.5 67 L 279 63.5 L 281 59.5 L 281 0 L 337 0 L 337 130.5 L 336 131.5 L 335 153.5 L 329 187.5 L 318 224.5 Q 302.9 261.4 274.5 285 Q 254.3 302.3 226.5 312 L 195.5 319 L 167.5 320 L 166.5 319 L 156.5 319 L 155.5 318 L 144.5 317 L 115.5 308 Q 86.9 295.6 67 274.5 L 47 248.5 L 29 211.5 L 0 165.5 L 0 64 L 11.5 66 Q 20.3 69.3 26 75.5 L 56.5 117 L 58 116.5 L 58 0 Z"
      />
    </Svg>
  );
};

export default HandCentralIcon;