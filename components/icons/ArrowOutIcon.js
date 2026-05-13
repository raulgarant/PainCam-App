import React from 'react';
import Svg, { Path } from 'react-native-svg';
const ArrowOutIcon = ({ fill = '#000', width = 55, height = 55 }) => (
  <Svg width={width} height={height} viewBox="0 0 24 24">
    <Path fill={fill} d="M6.41 6L5 7.41 9.58 12 5 16.59 6.41 18l6-6-6-6zM13 6l-1.41 1.41L16.17 12l-4.58 4.59L13 18l6-6-6-6z" />
  </Svg>
);
export default ArrowOutIcon;