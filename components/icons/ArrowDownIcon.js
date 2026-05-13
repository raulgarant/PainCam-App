import React from 'react';
import Svg, { Path } from 'react-native-svg';
const ArrowDownIcon = ({ fill = '#000', width = 55, height = 55 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24">
    <Path fill={fill} d="M11 4h2v12l5.5-5.5 1.42 1.42L12 19.84l-7.92-7.92L5.5 10.5 11 16V4z" />
  </Svg>
);
export default ArrowDownIcon;