import React from 'react';
import Svg, { Path } from 'react-native-svg';
const ArrowUpIcon = ({ fill = '#000', width = 55, height = 55 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24">
    <Path fill={fill} d="M13 20h-2V8l-5.5 5.5-1.42-1.42L12 4.16l7.92 7.92-1.42 1.42L13 8v12z" />
  </Svg>
);
export default ArrowUpIcon;