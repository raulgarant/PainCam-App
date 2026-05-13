import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import TopHeader from '../components/TopHeader';

// Importación de Iconos
import PalmIcon from '../components/icons/PalmIcon';
import BackHandIcon from '../components/icons/BackHandIcon';
import HandCentralIcon from '../components/icons/HandCentralIcon';
import ThumbIcon from '../components/icons/ThumbIcon';
import IndexFingerIcon from '../components/icons/IndexFingerIcon';
import MiddleFingerIcon from '../components/icons/MiddleFingerIcon';
import RingFingerIcon from '../components/icons/RingFingerIcon';
import PinkyFingerIcon from '../components/icons/PinkyFingerIcon';

const HandDetailScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [step, setStep] = useState(1);
  const [handData, setHandData] = useState({ cara: '', zona: '', dedo: '' });
  const [activeZone, setActiveZone] = useState(null);

  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  const options = useMemo(() => {
    if (step === 1) {
      return [
        { id: 'Palmar', name: 'Cara Palmar', IconComponent: PalmIcon },
        { id: 'Dorsal', name: 'Cara Dorsal', IconComponent: BackHandIcon }
      ];
    } else if (step === 2) {
      return [
        { id: 'Centro', name: 'Centro', IconComponent: HandCentralIcon },
        { id: 'Dedos', name: 'Dedos', IconComponent: PalmIcon }
      ];
    } else {
      return [
        { id: 'Pulgar', name: 'Pulgar', IconComponent: ThumbIcon },
        { id: 'Índice', name: 'Índice', IconComponent: IndexFingerIcon },
        { id: 'Medio', name: 'Medio', IconComponent: MiddleFingerIcon },
        { id: 'Anular', name: 'Anular', IconComponent: RingFingerIcon },
        { id: 'Meñique', name: 'Meñique', IconComponent: PinkyFingerIcon }
      ];
    }
  }, [step]);

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
    setLayouts({}); 
    setActiveZone(null);
  }, [step]);

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
      if (step > 1) setStep(step - 1);
      else navigation.goBack();
      return;
    }

    if (step === 1) {
      setHandData(prev => ({ ...prev, cara: id }));
      setStep(2);
    } else if (step === 2) {
      if (id === 'Centro') {
        finalizar({ ...handData, zona: 'Centro', dedo: 'N/A' });
      } else {
        setHandData(prev => ({ ...prev, zona: 'Dedos' }));
        setStep(3);
      }
    } else if (step === 3) {
      finalizar({ ...handData, dedo: id });
    }
  };

  const finalizar = (finalData) => {
    updatePainData('detalleMano', finalData);
    navigation.navigate('Summary');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader 
        onBackPress={() => handleSelection('back')}
        onLayoutBack={(e) => {
          cardRefs.current['back'] = e.target;
          measureElement('back');
        }}
        isBackActive={activeZone === 'back'}
      />
      <View style={styles.header}>
        <Text style={styles.title}>
          {step === 1 ? 'Mano' : step === 2 ? 'Zona de la Mano' : 'Dedos'}
        </Text>
        <Text style={styles.subtitle}>Toca o parpadea para seleccionar</Text>
      </View>

      <View style={styles.grid}>
        {options.map((option, index) => {
          const isActive = activeZone === option.id;
          
          let cardStyle;
          if (step < 3) {
            cardStyle = styles.cardLarge;
          } else {
            cardStyle = index < 3 ? styles.cardStep3Row1 : styles.cardStep3Row2;
          }

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
                cardStyle,
                { borderColor: "#EA580C" }, 
                isActive && { backgroundColor: '#EA580C', borderColor: '#a53f09' }
              ]}
            >
              <View style={styles.iconContainer}>
                {IconComponent && (
                  <IconComponent 
                    fill={iconColor} 
                    width={step < 3 ? 120 : 70} 
                    height={step < 3 ? 120 : 70} 
                  />
                )}
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

      {calibratedCursor && (
        <View style={[styles.cursor, { left: calibratedCursor.x - 12, top: calibratedCursor.y - 12 }]} pointerEvents="none" />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF0F2', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#6B7280', marginTop: 10, fontWeight: 'bold' },
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
    width: '48%', 
    height: 450, 
  },
  cardStep3Row1: { 
    width: '32%', 
    height: 220, 
  },
  cardStep3Row2: { 
    width: '32%', 
    height: 220, 
  },
  iconContainer: {
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 5 },
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

export default HandDetailScreen;