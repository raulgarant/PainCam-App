import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BlinkContext = createContext();

// Número total de puntos de calibración (5x5)
const TOTAL_POINTS = 25;

export const BlinkProvider = ({ children }) => {
  const [blinkTimestamp, setBlinkTimestamp] = useState(0); 
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [rawGaze, setRawGaze] = useState({ x: 0, y: 0 }); 
  const [rawGazeDirection, setRawGazeDirection] = useState('center'); 

  const [calibrationData, setCalibrationData] = useState([]);
  const [calibratedCursor, setCalibratedCursor] = useState({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });

  // --- REFERENCIAS PARA EL AMORTIGUADOR GLOBAL ---
  const smoothedX = useRef(SCREEN_WIDTH / 2);
  const smoothedY = useRef(SCREEN_HEIGHT / 2);
  const SMOOTHING_FACTOR = 0.15; 

  // Motor Matemático IDW + Filtro Suavizado
  useEffect(() => {
    if (calibrationData.length === TOTAL_POINTS) {
      let sumWeightX = 0, sumWeightY = 0, sumWeight = 0;

      for (let i = 0; i < TOTAL_POINTS; i++) {
        const pt = calibrationData[i];
        const dist = Math.sqrt(Math.pow(rawGaze.x - pt.raw.x, 2) + Math.pow(rawGaze.y - pt.raw.y, 2));

        if (dist < 0.0001) {
          // Si mira exacto al punto
          smoothedX.current = smoothedX.current + (pt.target.x - smoothedX.current) * SMOOTHING_FACTOR;
          smoothedY.current = smoothedY.current + (pt.target.y - smoothedY.current) * SMOOTHING_FACTOR;
          setCalibratedCursor({ x: smoothedX.current, y: smoothedY.current });
          return;
        }

        const weight = 1.0 / Math.pow(dist, 3);
        sumWeightX += weight * pt.target.x;
        sumWeightY += weight * pt.target.y;
        sumWeight += weight;
      }

      // Calculamos el objetivo real
      const targetX = sumWeightX / sumWeight;
      const targetY = sumWeightY / sumWeight;

      // APLICAMOS EL AMORTIGUADOR
      smoothedX.current = smoothedX.current + (targetX - smoothedX.current) * SMOOTHING_FACTOR;
      smoothedY.current = smoothedY.current + (targetY - smoothedY.current) * SMOOTHING_FACTOR;

      // Guardamos la posición ya suavizada
      setCalibratedCursor({ x: smoothedX.current, y: smoothedY.current });
    }
  }, [rawGaze, calibrationData]);

  const gazeDirection = useMemo(() => {
    if (calibrationData.length === TOTAL_POINTS) {
      const thirdX = SCREEN_WIDTH / 3;
      const thirdY = SCREEN_HEIGHT / 3;
      
      let h = 'center', v = 'center';
      if (calibratedCursor.x < thirdX) h = 'left';
      else if (calibratedCursor.x > thirdX * 2) h = 'right';
      
      if (calibratedCursor.y < thirdY) v = 'top';
      else if (calibratedCursor.y > thirdY * 2) v = 'bottom';

      if (v !== 'center' && h !== 'center') return `${v}-${h}`;
      if (v !== 'center') return v;
      if (h !== 'center') return h;
      return 'center';
    }
    return rawGazeDirection;
  }, [calibrationData.length, calibratedCursor, rawGazeDirection]);

  return (
    <BlinkContext.Provider value={{ 
      blinkTimestamp, setBlinkTimestamp,
      isFaceDetected, setIsFaceDetected,
      gazeDirection, setRawGazeDirection, 
      rawGaze, setRawGaze,
      calibrationData, setCalibrationData,
      calibratedCursor
    }}>
      {children}
    </BlinkContext.Provider>
  );
};

export const useBlink = () => useContext(BlinkContext);