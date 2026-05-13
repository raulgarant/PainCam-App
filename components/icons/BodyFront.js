import React from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';

export const BodyFrontSvg = ({ color }) => (
  <Svg width="100" height="150" viewBox="0 0 100 120">
    <Circle cx="50" cy="15" r="12" fill={color} />
    <Circle cx="45" cy="13" r="1.5" fill="#FFF" /> 
    <Circle cx="55" cy="13" r="1.5" fill="#FFF" />
    <Rect x="35" y="30" width="30" height="45" rx="8" fill={color} />
    <Rect x="20" y="32" width="12" height="40" rx="6" fill={color} />
    <Rect x="68" y="32" width="12" height="40" rx="6" fill={color} />
    <Rect x="37" y="70" width="12" height="45" rx="6" fill={color} />
    <Rect x="51" y="70" width="12" height="45" rx="6" fill={color} />
  </Svg>
);