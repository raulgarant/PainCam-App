import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import TopHeader from '../components/TopHeader';


import FaceIcon from '../components/icons/FaceIcon'; 
import SkullIcon from '../components/icons/SkullIcon'; 
import NeckFrontIcon from '../components/icons/NeckFrontIcon';
import NapeIcon from '../components/icons/NapeIcon';


const HeadNeckDetailScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { painData, updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [activeZone, setActiveZone] = useState(null);
  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  // Lógica de opciones dinámicas según la vista
  const options = useMemo(() => {
    const isFront = painData.vistaCuerpo === 'Delante';

    if (isFront) {
      return [
        { id: 'Cara', name: 'Cara / Rostro', type: 'svg', IconComponent: FaceIcon, icon: '🎭' },
        { id: 'Cráneo', name: 'Cráneo Superior', type: 'svg', IconComponent: SkullIcon, icon: '💀' },
        { id: 'Cuello', name: 'Garganta / Cuello', type: 'svg', IconComponent: NeckFrontIcon, icon: '🧣' },
      ];
    } else {
      return [
        { id: 'Cráneo', name: 'Cráneo Posterior', type: 'svg', IconComponent: SkullIcon, icon: '💀' },
        { id: 'Nuca', name: 'Nuca', type: 'svg', IconComponent: NapeIcon, icon: '👤' },
        { id: 'Cuello_Post', name: 'Cuello Posterior', type: 'svg', IconComponent: NeckFrontIcon, icon: '🦒' },
      ];
    }
  }, [painData.vistaCuerpo]);

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
    updatePainData('subRegion', id);
    const { tipo } = painData;
    if (tipo === 'Irradiado') {
      navigation.navigate('RadiatingDestination');
    } else {
      navigation.navigate('Summary'); 
    }
  };

  const renderCursor = () => {
    if (!calibratedCursor) return null;
    return <View style={[styles.cursor, { left: calibratedCursor.x - 10, top: calibratedCursor.y - 10 }]} pointerEvents="none" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader 
        title="¿Qué zona exacta?" 
        onBackPress={() => navigation.goBack()}
        onLayoutBack={(e) => {
          cardRefs.current['back'] = e.target;
          measureElement('back');
        }}
        isBackActive={activeZone === 'back'}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Cabeza y Cuello</Text>
        <Text style={styles.subtitle}>Vista: {painData.vistaCuerpo}</Text>
      </View>

      <View style={styles.grid}>
        {options.map((option) => {
          const isActive = activeZone === option.id;
          const iconColor = isActive ? '#FFFFFF' : '#111827';
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
                isActive ? styles.cardActive : styles.cardInactive
              ]}
            >
              <View style={styles.iconContainer}>
                {option.type === 'svg' && IconComponent ? (
                  <IconComponent fill={iconColor} width={60} height={60} />
                ) : (
                  <Text style={styles.icon}>{option.icon}</Text>
                )}
              </View>
              <Text style={[styles.cardTitle, isActive ? styles.textWhite : { color: '#111827' }]}>
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
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
  subtitle: { fontSize: 18, color: '#6B7280', fontWeight: 'bold', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  card: { 
    width: '32%', 
    height: 450, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 4, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardActive: { backgroundColor: "#EA580C", borderColor: '#a53f09' },
  cardInactive: { backgroundColor: '#FFF', borderColor: "#EA580C" },
  iconContainer: { marginBottom: 10, height: 70, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 50 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  textWhite: { color: '#FFF' },
  cursor: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.8)', borderWidth: 2, borderColor: '#FFF', zIndex: 9999 },
});

export default HeadNeckDetailScreen;