import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import TopHeader from '../components/TopHeader';

import ShoulderIcon from '../components/icons/ShoulderIcon';
import UpperArmIcon from '../components/icons/UpperArmIcon';
import PalmIcon from '../components/icons/PalmIcon';
import GluteIcon from '../components/icons/GluteIcon';
import ThighIcon from '../components/icons/ThighIcon';
import FootIcon from '../components/icons/FootIcon';
import ElbowIcon from '../components/icons/ElbowIcon';
import ArmIcon from '../components/icons/ArmIcon';
import ArrowUpIcon from '../components/icons/ArrowUpIcon';
import ArrowDownIcon from '../components/icons/ArrowDownIcon';
import ArrowOutIcon from '../components/icons/ArrowOutIcon';

const RadiatingDestinationScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { painData, updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [activeZone, setActiveZone] = useState(null);
  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

const options = useMemo(() => {
    const origenStr = String(painData.subRegion || painData.region || '').toLowerCase();
    
    if (origenStr.includes('cabeza') || origenStr.includes('cuello')) {
      return [
        { id: 'Hombro', name: 'Hombro', IconComponent: ShoulderIcon, color: '#EA580C' },
        { id: 'Brazo', name: 'Brazo', IconComponent: UpperArmIcon, color: '#EA580C' },
        { id: 'Mano/Dedos', name: 'Mano y Dedos', IconComponent: PalmIcon, color: '#EA580C' }
      ];
    }
    
    if (origenStr.includes('lumbar')) {
      return [
        { id: 'Glúteo', name: 'Glúteo', IconComponent: GluteIcon, color: '#EA580C' },
        { id: 'Muslo Posterior', name: 'Muslo Trasero', IconComponent: HamstringIcon, color: '#EA580C' },
        { id: 'Pantorrilla/Pie', name: 'Pantorrilla o Pie', IconComponent: FootIcon, color: '#EA580C' }
      ];
    }
    
    if (origenStr.includes('hombro')) {
      return [
        { id: 'Brazo Superior', name: 'Brazo', IconComponent: UpperArmIcon, icon: '💪', color: '#EA580C' },
        { id: 'Codo', name: 'Codo', IconComponent: ElbowIcon, icon: '📐', color: '#EA580C' },
        { id: 'Cuello', name: 'Cuello', IconComponent: ArrowUpIcon, icon: '👤', color: '#EA580C' } // Usamos ArrowUpIcon temporalmente si no hay CuelloIcon
      ];
    }
    
    if (origenStr.includes('pecho') || origenStr.includes('abdomen')) {
      return [
        { id: 'Brazo Izquierdo', name: 'Brazo Izquierdo', IconComponent: LeftArmIcon, icon: '💪', color: '#EA580C' },
        { id: 'Más arriba', name: 'Hacia arriba', IconComponent: ArrowUpIcon, icon: '⬆️', color: '#EA580C' },
        { id: 'Más abajo', name: 'Hacia abajo', IconComponent: ArrowDownIcon, icon: '⬇️', color: '#EA580C' }
      ];
    }
    
    if (origenStr.includes('codo')) {
      return [
        { id: 'Brazo', name: 'Hacia arriba', IconComponent: ShoulderIcon, icon: '⬆️', color: '#EA580C' },
        { id: 'Mano', name: 'Hacia la mano', IconComponent: PalmIcon, icon: '🖐️', color: '#EA580C' }
      ];
    }

    // Default
    return [
      { id: 'Más abajo', name: 'Hacia abajo', IconComponent: ArrowDownIcon, color: '#EA580C' },
      { id: 'Más arriba', name: 'Hacia arriba', IconComponent: ArrowUpIcon, color: '#EA580C' },
      { id: 'Hacia afuera', name: 'Hacia afuera', IconComponent: ArrowOutIcon, color: '#EA580C' }
    ];
  }, [painData.subRegion, painData.region]);

  const measureElement = (id) => {
    setTimeout(() => {
      if (cardRefs.current[id]) {
        cardRefs.current[id].measure((x, y, width, height, pageX, pageY) => {
          if (width > 0 && height > 0) {
            setLayouts(prev => ({ 
              ...prev, 
              [id]: { left: pageX, right: pageX + width, top: pageY, bottom: pageY + height } 
            }));
          }
        });
      }
    }, 100);
  };

  useEffect(() => {
    setLayouts({});
    setActiveZone(null);
    options.forEach(opt => measureElement(opt.id));
    measureElement('back');
  }, [options]);

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

  useEffect(() => {
    if (!isFocused) {
      lastProcessedBlink.current = blinkTimestamp;
      return;
    }
    if (blinkTimestamp > lastProcessedBlink.current) {
      lastProcessedBlink.current = blinkTimestamp;
      if (activeZone) handleSelection(activeZone);
    }
  }, [blinkTimestamp, isFocused, activeZone]);

  const handleSelection = (id) => {
    if (id === 'back') {
      navigation.goBack();
      return;
    }
    updatePainData('destinoIrradiado', id);
    navigation.navigate('Summary'); 
  };

  const renderCursor = () => {
    if (!calibratedCursor) return null;
    return <View style={[styles.cursor, { left: calibratedCursor.x - 12, top: calibratedCursor.y - 12 }]} pointerEvents="none" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader 
        title="¿Hacia dónde se mueve?"
        onBackPress={() => handleSelection('back')}
        onLayoutBack={(e) => {
          cardRefs.current['back'] = e.target;
          measureElement('back');
        }}
        isBackActive={activeZone === 'back'}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Dolor Irradiado</Text>
        <Text style={styles.subtitle}>Origen: {painData.subRegion || painData.region} | Elija la localización final de su dolor</Text>
      </View>

      <View style={styles.grid}>
        {options.map((option) => {
          const isActive = activeZone === option.id;
          const cardStyle = options.length <= 2 ? styles.cardLarge : styles.cardMedium;
          const IconComponent = option.IconComponent;

          return (
            <TouchableOpacity 
              key={option.id} 
              activeOpacity={0.7}
              ref={el => cardRefs.current[option.id] = el}
              onLayout={() => measureElement(option.id)}
              onPress={() => handleSelection(option.id)}
              style={[
                styles.card, 
                cardStyle,
                { borderColor: "#EA580C" }, 
                isActive && { backgroundColor: '#EA580C', borderColor: '#a53f09' }
              ]}
            >
              <View style={styles.iconContainer}>
                {IconComponent && <IconComponent fill={isActive ? '#FFF' : '#111827'} width={70} height={70} />}
              </View>
              <Text style={[
                styles.cardTitle, 
                isActive ? styles.textWhite : { color: '#111827' }
              ]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {renderCursor()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF0F2', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 18, color: '#6B7280', marginTop: 5, fontWeight: 'bold' },
  grid: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 20, 
    width: '100%',
    paddingHorizontal: 10
  },
  card: { 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 4, 
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardLarge: { width: '45%', height: 400 },
  cardMedium: { width: '31%', height: 400 },
  iconContainer: { marginBottom: 20 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  textWhite: { color: '#FFF' },
  cursor: { 
    position: 'absolute', width: 24, height: 24, borderRadius: 12, 
    backgroundColor: 'rgba(59, 130, 246, 0.8)', borderWidth: 2, borderColor: '#FFF', zIndex: 9999 
  }
});

export default RadiatingDestinationScreen;