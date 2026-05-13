import React, { useMemo, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera'; 
import { useSharedValue, Worklets } from 'react-native-worklets-core';
import { useBlink } from './BlinkContext';

export const GlobalBlinkDetector = () => {
  const { setBlinkTimestamp, setIsFaceDetected, setRawGazeDirection, setRawGaze } = useBlink();
  const device = useCameraDevice('front');
  
  const isBlinking = useSharedValue(false);
  const lastFaceState = useSharedValue(false);
  const lastDirection = useSharedValue('center');
  const smoothedX = useSharedValue(0);
  const smoothedY = useSharedValue(0);
  const frameCounter = useSharedValue(0);
  
  const handleBlinkClick = useMemo(() => Worklets.createRunOnJS(() => {
    setBlinkTimestamp(Date.now());
  }), [setBlinkTimestamp]);

  const updateReactState = useMemo(() => Worklets.createRunOnJS((detected, direction, rawX, rawY) => {
    setIsFaceDetected(detected);
    setRawGazeDirection(direction); // <-- Cambia esto aquí
    setRawGaze({ x: rawX, y: rawY }); 
  }), [setIsFaceDetected, setRawGazeDirection, setRawGaze]);

  const plugin = useMemo(() => {
    try { return VisionCameraProxy.initFrameProcessorPlugin('detectIris'); } 
    catch (e) { return null; }
  }, []);

  const executeAction = () => {
    if (actionRef.current) actionRef.current();
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (plugin == null) return;

    try {
      const result = plugin.call(frame);
      const hasFace = result && result.eyeBlinkLeft !== undefined;

      let currentDirection = lastDirection.value; 

      if (hasFace) {
        let v = 'center', h = 'center';
        
        const leftLook = Math.max(result.eyeLookOutLeft || 0, result.eyeLookInRight || 0);
        const rightLook = Math.max(result.eyeLookOutRight || 0, result.eyeLookInLeft || 0);
        const upLook = Math.max(result.eyeLookUpLeft || 0, result.eyeLookUpRight || 0);
        const downLook = Math.max(result.eyeLookDownLeft || 0, result.eyeLookDownRight || 0) * 1.5;

        // --- NUEVA LÓGICA DE ESTABILIZACIÓN (COMPENSACIÓN DEL CUELLO) ---
        // Ajusta headPitch y headYaw si tu plugin usa otros nombres para la rotación
        const headPitch = result.headPitch || 0; 
        const headYaw = result.headYaw || 0;

        const PITCH_COMPENSATION = 0.015; 
        const YAW_COMPENSATION = 0.015;

        const rawTargetX = rightLook - leftLook;
        const rawTargetY = downLook - upLook;

        const targetX = rawTargetX - (headYaw * YAW_COMPENSATION);
        const targetY = rawTargetY - (headPitch * PITCH_COMPENSATION);

        // --- MAGIA: SUAVIZADO EXPONENCIAL ---
        smoothedX.value = (smoothedX.value * 0.7) + (targetX * 0.3);
        smoothedY.value = (smoothedY.value * 0.7) + (targetY * 0.3);

        if (result.eyeLookUpLeft > 0.1 && result.eyeLookUpRight > 0.1) v = 'top';
        else if (result.eyeLookDownLeft > 0.3 && result.eyeLookDownRight > 0.3) v = 'bottom';
        if (result.eyeLookOutRight > 0.4 && result.eyeLookInLeft > 0.4) h = 'right';
        else if (result.eyeLookOutLeft > 0.4 && result.eyeLookInRight > 0.4) h = 'left';

        if (v !== 'center' && h !== 'center') currentDirection = `${v}-${h}`; 
        else if (v !== 'center') currentDirection = v;            
        else if (h !== 'center') currentDirection = h;            

        // --- FILTRO DE FPS (Mantiene React fluido) ---
        frameCounter.value += 1;

        if (
          currentDirection !== lastDirection.value || 
          hasFace !== lastFaceState.value || 
          frameCounter.value % 3 === 0
        ) {
          updateReactState(hasFace, currentDirection, smoothedX.value, smoothedY.value);
          
          lastFaceState.value = hasFace;
          lastDirection.value = currentDirection;
        }

        // --- DETECCIÓN DE PARPADEO ---
        if (result.eyeBlinkLeft > 0.6 && result.eyeBlinkRight > 0.6) {
          if (!isBlinking.value) {
            isBlinking.value = true;
            handleBlinkClick(); 
            console.log("Parpadeo detectado")
          }
        } else if (result.eyeBlinkLeft < 0.4 && result.eyeBlinkRight < 0.4) {
          isBlinking.value = false;
        }

      } else {
        if (lastFaceState.value !== false) {
          lastFaceState.value = false;
          lastDirection.value = 'center';
          updateReactState(false, 'center', 0, 0);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }, [plugin, handleBlinkClick, updateReactState]); 

  if (!device) return null;

  return (
    <Camera 
      style={styles.hiddenCamera} 
      device={device} 
      isActive={true} 
      frameProcessor={frameProcessor} 
      pixelFormat="yuv" 
    />
  );
};

const styles = StyleSheet.create({ 
  hiddenCamera: { position: 'absolute', width: 1, height: 1, opacity: 0 } 
});