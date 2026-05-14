import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import TopHeader from '../components/TopHeader';

import ChestIcon from '../components/icons/ChestIcon';
import AbdomenIcon from '../components/icons/AbdomenIcon';
import PelvisIcon from '../components/icons/PelvisIcon';
import SidesIcon from '../components/icons/SidesIcon';
import UpperBackIcon from '../components/icons/UpperBackIcon';
import LowerBackIcon from '../components/icons/LowerBackIcon';

const TrunkDetailScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { painData, updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [activeZone, setActiveZone] = useState(null);
  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  const isFront = painData.vistaCuerpo === 'Delante';

  const options = useMemo(() => {
    if (isFront) {
      return [
        { id: 'Pecho', name: 'Pecho', type: 'svg', IconComponent: ChestIcon },
        { id: 'Abdomen', name: 'Abdomen', type: 'svg', IconComponent: AbdomenIcon },
        { id: 'Pelvis', name: 'Pelvis', type: 'svg', IconComponent: PelvisIcon },
        { id: 'Laterales', name: 'Laterales', type: 'svg', IconComponent: SidesIcon }
      ];
    } else {
      return [
        { id: 'Espalda_Alta', name: 'Espalda Alta', type: 'svg', IconComponent: UpperBackIcon },
        { id: 'Lumbar', name: 'Zona Lumbar', type: 'svg', IconComponent: LowerBackIcon }
      ];
    }
  }, [isFront]);

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
    if (painData.tipo === 'Irradiado') {
      navigation.navigate('RadiatingDestination');
    } else {
      navigation.navigate('Summary');
    }
  };

  const renderCursor = () => {
    if (!calibratedCursor) return null;
    return <View style={[styles.cursor, { left: calibratedCursor.x - 10, top: calibratedCursor.y - 10 }]} pointerEvents="none" />;
  };

  const isTwoOptions = options.length === 2;

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
        <Text style={styles.title}>{isFront ? 'Tronco' : 'Espalda'}</Text>
        <Text style={styles.subtitle}>Toca o parpadea para seleccionar</Text>
      </View>

      <View style={[styles.containerOpciones, styles.grid]}>
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
                styles.cardBase, 
                styles.cardGrid,
                isTwoOptions ? styles.cardTall : styles.cardNormal,
                { borderColor: "#EA580C" }, 
                isActive && { backgroundColor: '#EA580C',  borderColor: '#a53f09'}
              ]}
            >
              <View style={styles.iconContainerGrid}>
                {IconComponent && <IconComponent fill={iconColor} width={100} height={100} />}
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
  title: { fontSize: 34, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#6B7280', fontWeight: 'bold' },
  containerOpciones: { width: '100%', paddingHorizontal: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  cardBase: { 
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
  cardGrid: { width: '48%' },
  cardNormal: { height: 220 },
  cardTall: { height: 450 },
  iconContainerGrid: { marginBottom: 15, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 35, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 10 },
  textWhite: { color: '#FFF' },
  cursor: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.8)', borderWidth: 2, borderColor: '#FFF', zIndex: 9999 },
});

export default TrunkDetailScreen;