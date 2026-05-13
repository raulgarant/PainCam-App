import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import TopHeader from '../components/TopHeader';

import { BodyFrontSvg } from '../components/icons/BodyFront';
import { BodyBackSvg } from '../components/icons/BodyBack';

const BodyMapScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [activeZone, setActiveZone] = useState(null);

  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  const options = useMemo(() => [
    { 
      id: 'Delante', 
      name: 'Delante', 
      SvgComponent: BodyFrontSvg, 
      color: '#111827'
    },
    { 
      id: 'Detras', 
      name: 'Detrás', 
      SvgComponent: BodyBackSvg, 
      color: '#111827'
    }
  ], []);

  const measureElement = (id) => {
    if (cardRefs.current[id]) {
      cardRefs.current[id].measure((x, y, width, height, pageX, pageY) => {
        setLayouts(prev => ({ 
          ...prev, 
          [id]: { left: pageX, right: pageX + width, top: pageY, bottom: pageY + height } 
        }));
      });
    }
  };

  // --- LÓGICA DE COLISIÓN (HIT TESTING) ---
  useEffect(() => {
    let foundZone = null;
    
    if (calibratedCursor) {
      Object.keys(layouts).forEach(id => {
        const box = layouts[id];
        if (
          calibratedCursor.x >= box.left && calibratedCursor.x <= box.right &&
          calibratedCursor.y >= box.top && calibratedCursor.y <= box.bottom
        ) {
          foundZone = id;
        }
      });
    }
    
    if (foundZone !== activeZone) setActiveZone(foundZone);
  }, [calibratedCursor, layouts, activeZone]);

  // --- LÓGICA DE PARPADEO CON ESCUDO DE ENFOQUE ---
  useEffect(() => {
    if (!isFocused) {
      lastProcessedBlink.current = blinkTimestamp;
      return;
    }

    if (blinkTimestamp > lastProcessedBlink.current) {
      lastProcessedBlink.current = blinkTimestamp;
      
      if (activeZone) {
        handleSelection(activeZone);
      }
    }
  }, [blinkTimestamp, isFocused, activeZone]);

  // --- NUEVA FUNCIÓN DE SELECCIÓN UNIFICADA ---
  const handleSelection = (id) => {
    const selected = options.find(o => o.id === id);
    if (selected) {
      updatePainData('vistaCuerpo', selected.id); 
      navigation.navigate('Zones'); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader/>
      <View style={styles.header}>
        <Text style={styles.title}>1º Mapa de todo el cuerpo</Text>
        <Text style={styles.subtitle}>Mira hacia tu opción y parpadea (o tócala)</Text>
      </View>

      <View style={styles.grid}>
        {options.map((option) => {
          const isActive = activeZone === option.id;
          const iconColor = isActive ? '#FFF' : option.color;
          return (
            <TouchableOpacity 
              key={option.id} 
              activeOpacity={0.7}
              ref={el => cardRefs.current[option.id] = el}
              onLayout={() => measureElement(option.id)}
              onPress={() => handleSelection(option.id)} // Lógica táctil añadida
              style={[
                styles.card, 
                { borderColor:  "#EA580C"}, 
                isActive && { backgroundColor: "#EA580C", borderColor: '#a53f09' }
              ]}
            >
              <option.SvgComponent color={iconColor} />
              <Text style={[styles.cardTitle, isActive ? styles.textWhite : { color: option.color }]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* CURSOR VISUAL AZUL */}
      {calibratedCursor && (
        <View 
          style={[
            styles.cursor, 
            { transform: [{ translateX: calibratedCursor.x - 10 }, { translateY: calibratedCursor.y - 10 }] }
          ]} 
          pointerEvents="none" 
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF0F2', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#6B7280' },
  grid: { flexDirection: 'row', justifyContent: 'center', gap: 20, width: '100%', paddingHorizontal: 20 },
  card: { flex: 1, height: 480, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 4, backgroundColor: '#FFF' },
  cardTitle: { fontSize: 40, fontWeight: 'bold', marginTop: 20 },
  textWhite: { color: '#FFF' },
  cursor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    borderWidth: 2,
    borderColor: '#FFF',
    zIndex: 9999,
  }
});

export default BodyMapScreen;