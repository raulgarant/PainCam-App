import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import TopHeader from '../components/TopHeader';

import LeftIcon from '../components/icons/LeftIcon';
import BothLegsIcon from '../components/icons/BothLegsIcon';
import RightIcon from '../components/icons/RightIcon';

import GluteIcon from '../components/icons/GluteIcon';
import ThighIcon from '../components/icons/ThighIcon';
import KneeIcon from '../components/icons/KneeIcon';
import BackKneeIcon from '../components/icons/BackKneeIcon';
import ShinIcon from '../components/icons/ShinIcon';
import CalfIcon from '../components/icons/CalfIcon';
import FootIcon from '../components/icons/FootIcon';
import AnkleIcon from '../components/icons/AnkleIcon';
import HeelIcon from '../components/icons/HeelIcon';

const LegDetailScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { painData, updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [step, setStep] = useState(1);
  const [activeZone, setActiveZone] = useState(null);
  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  const isFront = painData.vistaCuerpo === 'Delante';

  const options = useMemo(() => {
    if (step === 1) {
      return [
        { id: 'Izquierda', name: 'Izquierda', IconComponent: LeftIcon },
        { id: 'Ambas', name: 'Ambas', IconComponent: BothLegsIcon },
        { id: 'Derecha', name: 'Derecha', IconComponent: RightIcon }
      ];
    } else {
      if (isFront) {
        return [
          { id: 'Muslo', name: 'Muslo', IconComponent: ThighIcon },
          { id: 'Rodilla', name: 'Rodilla', IconComponent: KneeIcon },
          { id: 'Espinilla', name: 'Espinilla', IconComponent: ShinIcon },
          { id: 'Tobillo', name: 'Tobillo', IconComponent: AnkleIcon },
          { id: 'Pie', name: 'Pie Completo', IconComponent: FootIcon }
        ];
      } else {
        return [
          { id: 'Glúteo', name: 'Glúteo', IconComponent: GluteIcon },
          { id: 'Isquiotibial', name: 'Muslo Trasero', IconComponent: ThighIcon },
          { id: 'Corva', name: 'Corva (Atrás Rodilla)', IconComponent: BackKneeIcon },
          { id: 'Gemelo', name: 'Gemelo', IconComponent: CalfIcon },
          { id: 'Talón', name: 'Talón', IconComponent: HeelIcon }
        ];
      }
    }
  }, [step, isFront]);

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
  }, [step, options]);

  useEffect(() => {
    let foundZone = null;
    if (calibratedCursor) {
      Object.keys(layouts).forEach(id => {
        const box = layouts[id];
        if (calibratedCursor.x >= box.left && calibratedCursor.x <= box.right &&
            calibratedCursor.y >= box.top && calibratedCursor.y <= box.bottom) {
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
      if (step === 2) setStep(1);
      else navigation.goBack();
      return;
    }

    if (step === 1) {
      updatePainData('ladoExtremidad', id);
      setStep(2);
    } else {
      updatePainData('subRegion', id);
      if (painData.tipo === 'Irradiado') {
        navigation.navigate('RadiatingDestination');
      } else if (id === 'Pie' && isFront) {
        navigation.navigate('FootDetail');
      } else {
        navigation.navigate('Summary');
      }
    }
  };

  const renderCursor = () => {
    if (!calibratedCursor) return null;
    return <View style={[styles.cursor, { left: calibratedCursor.x - 12, top: calibratedCursor.y - 12 }]} pointerEvents="none" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader 
        title={step === 1 ? "¿Qué lado?" : "¿Qué zona exacta?"}
        onBackPress={() => handleSelection('back')}
        onLayoutBack={(e) => {
          cardRefs.current['back'] = e.target;
          measureElement('back');
        }}
        isBackActive={activeZone === 'back'}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>{step === 1 ? 'Piernas' : `Pierna ${painData.ladoExtremidad || ''}`}</Text>
        <Text style={styles.subtitle}>Toca o parpadea para seleccionar</Text>
      </View>

      <View style={styles.grid}>
        {options.map((option, index) => {
          const isActive = activeZone === option.id;
          let cardStyle;
          
          if (step === 1) {
            cardStyle = styles.cardLarge;
          } else {
            cardStyle = index < 3 ? styles.cardStep2Row1 : styles.cardStep2Row2;
          }

          const iconSize = step === 1 ? 80 : 55;
          const titleSize = step === 1 ? 24 : 18;
          const iconColor = isActive ? '#FFFFFF' : '#111827';
          const IconComponent = option.IconComponent;

          return (
            <TouchableOpacity 
              key={option.id} 
              ref={el => cardRefs.current[option.id] = el}
              onLayout={() => measureElement(option.id)}
              onPress={() => handleSelection(option.id)}
              activeOpacity={0.7}
              style={[
                styles.card, 
                cardStyle,
                { borderColor: "#EA580C" }, 
                isActive && { backgroundColor: '#EA580C', borderColor: '#a53f09' }
              ]}
            >
              <View style={[styles.iconContainer, { height: iconSize }]}>
                {IconComponent && <IconComponent fill={iconColor} width={iconSize} height={iconSize} />}
              </View>
              <Text style={[
                styles.cardTitle, 
                { fontSize: titleSize },
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
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#6B7280', fontWeight: 'bold' },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 15,
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
  cardLarge: { 
    width: '32%', 
    height: 450, 
  },
  cardStep2Row1: { 
    width: '32%', 
    height: 220, 
  },
  cardStep2Row2: { 
    width: '32%', 
    height: 220, 
  },
  iconContainer: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: { fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 5 },
  textWhite: { color: '#FFF' },
  cursor: { 
    position: 'absolute', 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    backgroundColor: 'rgba(59, 130, 246, 0.8)', 
    borderWidth: 2, 
    borderColor: '#FFF', 
    zIndex: 9999 
  }
});

export default LegDetailScreen;