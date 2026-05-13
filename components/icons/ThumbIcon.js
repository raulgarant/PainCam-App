import React from 'react';
import Svg, { Path } from 'react-native-svg';

const ThumbIcon = ({ fill = '#000000', width = 55, height = 55 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 512 512">
      {/* Silueta principal del dedo pulgar y estructura */}
      <Path
        fill={fill}
        d="M 272.5 31 L 282.5 31 L 289.5 33 Q 304.8 39.8 315 51.5 Q 327.9 65.1 335 84.5 L 339 99.5 L 340 117.5 L 339 118.5 L 339 129.5 L 338 130.5 L 335 153.5 L 324 195 L 457.5 195 Q 482 199.5 494 216.5 Q 500.6 224.4 503 236.5 L 503 254.5 Q 499.9 270.9 490 280.5 Q 498.4 287.6 502 299.5 Q 504.8 308.2 503 321.5 Q 498.7 338.7 486.5 348 L 478 353.5 L 483 367.5 L 483 379.5 Q 479.2 399.7 465.5 410 L 458 414 L 462 426.5 L 462 444.5 Q 457.9 460.9 446.5 470 L 435.5 477 L 420.5 481 L 220.5 481 L 194.5 476 L 182.5 472 L 177 468.5 L 177 249.5 L 179 249 L 179 247.5 L 238 121.5 L 238 48.5 L 244.5 41 L 256.5 35 L 272.5 31 Z"
      />
      {/* Base/Articulación inferior */}
      <Path
        fill={fill}
        d="M 56.5 236 L 155 236 L 155 492 L 141.5 499 L 133.5 501 L 54.5 501 Q 33.6 496.4 23 481.5 Q 15.5 472.5 13 458.5 L 13 278.5 Q 17.2 257.7 31.5 247 Q 41 238.5 56.5 236 Z"
      />
    </Svg>
  );
};

export default ThumbIcon;