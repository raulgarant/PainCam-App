import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { useSharedValue, Worklets } from 'react-native-worklets-core';

import { VisionCameraProxy } from 'react-native-vision-camera';

const plugin = VisionCameraProxy.initFrameProcessorPlugin('detectIris');

export function detectIris(frame) {
  'worklet';
  if (plugin == null) throw new Error('Failed to load Frame Processor Plugin!');
  return plugin.call(frame);
}

export default function TrackingScreen({ navigation }) {
  const device = useCameraDevice('front');
  const [hasPermission, setHasPermission] = useState(false);
  const [status, setStatus] = useState('Buscando rostro...');
  
  // Animación para el progreso visual de 2 segundos
  const progress = useRef(new Animated.Value(0)).current;

  const { detectFaces } = useFaceDetector({
    classificationMode: 'all',
    trackingEnabled: true,
  });

  useEffect(() => {
    (async () => {
      const p = await Camera.requestCameraPermission();
      setHasPermission(p === 'granted');
    })();
  }, []);

  // Se ejecuta al completar los 2 segundos
  const onConfirm = Worklets.createRunOnJS(() => {
    setStatus('¡SELECCIONADO! ✅');
    // navigation.navigate('SiguientePantalla'); 
  });

  // Controla la animación desde el hilo principal
  const updateUI = Worklets.createRunOnJS((msg, isClosing) => {
    setStatus(msg);
    if (isClosing) {
      Animated.timing(progress, {
        toValue: 1,
        duration: 100, // 2000 ms = 2 segundos
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) onConfirm();
      });
    } else {
      progress.setValue(0);
      Animated.timing(progress).stop();
    }
  });

  // 1. Candado moderno
  const isBlinking = useSharedValue(false);

  // 2. Función moderna para volver a React Native de forma segura
  const handleBlinkClick = Worklets.createRunOnJS(() => {
    console.log("🚀 Navegando a la pantalla de dolor...");
    
    // 1. Navegamos a la siguiente pantalla
    navigation.navigate('Home'); 
    
    // Nota: Si tu pantalla se llama distinto (ej. 'PainMap'), 
    // cambia 'BodyScreen' por el nombre exacto que pusiste en App.js
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    try {
      const result = detectIris(frame);
      
      if (result.blinkLeft !== undefined && result.blinkRight !== undefined) {
        
        // Si los ojos están cerrados
        if (result.blinkLeft > 0.6 && result.blinkRight > 0.6) {
          if (!isBlinking.value) {
             isBlinking.value = true; // Cerramos candado
             handleBlinkClick(); // Llamamos a la función segura
          }
        } 
        // Si los ojos están abiertos
        else if (result.blinkLeft < 0.4 && result.blinkRight < 0.4) {
          isBlinking.value = false; // Abrimos candado
        }
        
      }

    } catch (e) {
      console.log("Error en plugin:", e);
    }
  }, []);

  if (!hasPermission || !device) return <View style={styles.center}><Text>Cargando...</Text></View>;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} frameProcessor={frameProcessor} />
      
      <View style={styles.overlay}>
        <Text style={styles.text}>{status}</Text>
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { 
            width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
          }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { 
    position: 'absolute', 
    bottom: 30, 
    left: '25%', 
    right: '25%', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    padding: 15, 
    borderRadius: 15 
  },
  text: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  progressBg: { width: '100%', height: 10, backgroundColor: '#555', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00FF00' }
});