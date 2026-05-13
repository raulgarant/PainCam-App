import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MARGIN_X = SCREEN_WIDTH * 0.025;  
const MARGIN_Y = SCREEN_HEIGHT * 0.025; 
const MAX_X = SCREEN_WIDTH * 0.975;
const MAX_Y = SCREEN_HEIGHT * 0.975;

const TOTAL_POINTS = 25;

const CALIBRATION_TARGETS = [];
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 5; col++) {
    CALIBRATION_TARGETS.push({
      id: `Point-${row}-${col}`,
      x: MARGIN_X + col * ((MAX_X - MARGIN_X) / 4),
      y: MARGIN_Y + row * ((MAX_Y - MARGIN_Y) / 4),
    });
  }
}

const CalibrationScreen = ({ navigation }) => {
  const { blinkTimestamp, isFaceDetected, rawGaze, setCalibrationData } = useBlink();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [calibStep, setCalibStep] = useState(-1);

  const latestGaze = useRef({ x: 0, y: 0 });
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    latestGaze.current = rawGaze;
  }, [rawGaze]);

  useEffect(() => {
    if (!isFocused) {
      lastProcessedBlink.current = blinkTimestamp;
      return;
    }

    if (blinkTimestamp > lastProcessedBlink.current) {
      lastProcessedBlink.current = blinkTimestamp;

      if (calibStep === -1) {
        setCalibrationData([]); 
        setCalibStep(0);
      }
    }
  }, [blinkTimestamp, isFocused, calibStep, setCalibrationData]);

  useEffect(() => {
    if (calibStep >= 0 && calibStep < TOTAL_POINTS) {
      progressAnim.setValue(0);

      const moveDelay = setTimeout(() => {
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1500, 
          easing: Easing.linear,
          useNativeDriver: true, 
        }).start(({ finished }) => {
          if (finished) {
            const currentTarget = CALIBRATION_TARGETS[calibStep];
            const gazeSnapshot = { ...latestGaze.current };
            
            setCalibrationData(prev => [...prev, { target: currentTarget, raw: gazeSnapshot }]);
            
            if (calibStep === TOTAL_POINTS - 1) {
              navigation.navigate('Intensity');
            } else {
              setCalibStep(prev => prev + 1);
            }
          }
        });
      }, 600); 

      return () => {
        clearTimeout(moveDelay);
        progressAnim.stopAnimation();
      };
    }
  }, [calibStep, progressAnim, setCalibrationData, navigation]);

  const ringScale = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 1] 
  });
  
  const ringOpacity = progressAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.8, 1] 
  });

  return (
    <SafeAreaView style={styles.container}>
      
      {calibStep === -1 && (
        <View style={styles.centerBox}>
          <Ionicons name="eye-outline" size={80} color="#3B82F6" />
          <Text style={styles.mainTitle}>Calibración Profesional</Text>
          <Text style={styles.subtitle}>
            {isFaceDetected ? "✅ Rostro detectado." : "❌ Buscando rostro..."}
          </Text>
          <View style={styles.blinkInstruction}>
            <Text style={styles.blinkText}>PARPADEA PARA COMENZAR</Text>
          </View>
        </View>
      )}

      {calibStep >= 0 && calibStep < TOTAL_POINTS && (
        <>
          <Text style={styles.helperText}>
            Mira fijamente el punto rojo ({calibStep + 1}/{TOTAL_POINTS})
          </Text>
          
          <View 
            style={[
              styles.targetWrapper, 
              { 
                left: CALIBRATION_TARGETS[calibStep].x - 15, 
                top: CALIBRATION_TARGETS[calibStep].y - 15 
              }
            ]} 
          >
            <Animated.View style={[styles.targetRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
            <View style={styles.targetDot} />
          </View>
        </>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' }, 
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  mainTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginTop: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#9CA3AF', marginTop: 10, textAlign: 'center' },
  helperText: { position: 'absolute', top: 50, width: '100%', textAlign: 'center', color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  
  blinkInstruction: { marginTop: 40, backgroundColor: '#3B82F6', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30 },
  blinkText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

  targetWrapper: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 10,
  },
  targetRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.2)', 
  }
});

export default CalibrationScreen;