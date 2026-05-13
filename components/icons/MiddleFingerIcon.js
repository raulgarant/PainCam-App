import React from 'react';
import Svg, { Path } from 'react-native-svg';

const MiddleFingerIcon = ({ fill = '#000000', width = 55, height = 55 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 512 512">
      {/* Silueta principal del dedo medio */}
      <Path
        fill={fill}
        d="M 247.5 0 Q 267 0.5 275 12.5 Q 280.4 19.1 282 29.5 L 282.5 217 Q 284.6 200.6 295.5 193 L 308.5 187 L 321.5 187 Q 335.3 190.3 342 200.5 L 345 205.5 L 348 216.5 L 348.5 235 Q 350.2 217.2 362.5 210 L 373.5 205 L 388.5 205 Q 401.3 208.7 408 218.5 L 411 223.5 L 414 236.5 L 414 366.5 L 362 447.5 L 362 483.5 L 363 484.5 L 363 512 L 174.5 512 L 174 511.5 L 174 489.5 L 173 488.5 L 173 448.5 L 172 446.5 L 98 354.5 L 98 282.5 L 99 281.5 L 99 273.5 L 104 258.5 L 117.5 241 L 131.5 232 L 143.5 228 L 149.5 228 L 151 226.5 Q 149.3 201.8 163.5 193 Q 171.8 184.8 190.5 187 Q 202.5 190 209 198.5 L 215 209.5 L 216.5 217 L 217 26.5 Q 220.3 12.8 230.5 6 L 235.5 3 L 247.5 0 Z"
      />
    </Svg>
  );
};

export default MiddleFingerIcon;