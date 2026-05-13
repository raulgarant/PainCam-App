import React from 'react';
import Svg, { Path } from 'react-native-svg';

const RadiatingIcon = ({ fill = '#000000', width = 45, height = 45 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M17 13L21 9M21 9L17 5M21 9H8C5.23858 9 3 11.2386 3 14C3 16.7614 5.23858 19 8 19H13" 
        stroke={fill} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  );
};

export default RadiatingIcon;