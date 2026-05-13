import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import LocationIcon from '../components/icons/LocationIcon';
import DiffuseIcon from '../components/icons/DiffuseIcon';
import RadiatingIcon from '../components/icons/RadiatingIcon';
import SharpIcon from '../components/icons/SharpIcon';
import BurningIcon from '../components/icons/BurningIcon';

import TopHeader from '../components/TopHeader';

const TypeScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [activeZone, setActiveZone] = useState(null);

  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  const options = useMemo(() => [
    { id: 'Localizado', name: 'Localizado', type: 'svg', IconComponent: LocationIcon },
    { id: 'Difuso', name: 'Difuso', type: 'svg', IconComponent:  DiffuseIcon},
    { id: 'Irradiado', name: 'Irradiado', type: 'svg', IconComponent: RadiatingIcon },
    { id: 'Punzante', name: 'Punzante', type: 'svg', IconComponent: SharpIcon },
    { id: 'Quemazón', name: 'Quemazón', type: 'svg', IconComponent: BurningIcon }
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
      updatePainData('tipo', selected.id);
      navigation.navigate('BodyMap'); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader/>
      <View style={styles.header}>
        <Text style={styles.title}>¿Qué tipo de dolor sientes?</Text>
        <Text style={styles.subtitle}>Mira hacia la opción y parpadea (o tócala)</Text>
      </View>

      <View style={styles.grid}>
        {options.map((option) => {
          const isActive = activeZone === option.id;

          const iconColor = isActive ? '#FFFFFF' : '#000000';
          return (
            <TouchableOpacity 
              key={option.id} 
              activeOpacity={0.7}
              ref={el => cardRefs.current[option.id] = el}
              onLayout={() => measureElement(option.id)}
              onPress={() => handleSelection(option.id)} // Lógica táctil añadida
              style={[styles.card, isActive ? styles.cardActive : styles.cardInactive]}
            >
              <View style={styles.iconContainer}>
                {option.type === 'svg' ? (
                  <option.IconComponent fill={iconColor} width={45} height={45} />
                ) : (
                  <Text style={styles.icon}>{option.icon}</Text>
                )}
              </View>
              <Text style={[styles.cardTitle, isActive ? styles.textWhite : styles.textBlue]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, paddingHorizontal: 10 },
  card: { width: '32%', height: 230, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  cardActive: { backgroundColor: '#EA580C', borderColor: '#a53f09' },
  cardInactive: { backgroundColor: '', borderColor: '#EA580C' },
  icon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 20, fontWeight: 'bold' },
  textWhite: { color: '#FFF' },
  textBlue: { color: '#374151' },
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

export default TypeScreen;