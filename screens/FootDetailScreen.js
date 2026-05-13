import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import TopHeader from '../components/TopHeader';

import FootIcon from '../components/icons/FootIcon';
import ToesIcon from '../components/icons/ToesIcon';
import SoleIcon from '../components/icons/SoleIcon';

const FootDetailScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { painData, updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [activeZone, setActiveZone] = useState(null);
  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  const options = useMemo(() => [
    { id: 'Empeine', name: 'Empeine', IconComponent: FootIcon },
    { id: 'Dedos', name: 'Dedos', IconComponent: ToesIcon },
    { id: 'Planta', name: 'Planta', IconComponent: SoleIcon }
  ], []);

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
      navigation.goBack();
      return;
    }

    updatePainData('detallePie', id);
    
    if (painData.tipo === 'Irradiado') {
      navigation.navigate('RadiatingDestination');
    } else {
      navigation.navigate('Summary');
    }
  };

  const renderCursor = () => {
    if (!calibratedCursor) return null;
    return <View style={[styles.cursor, { left: calibratedCursor.x - 12, top: calibratedCursor.y - 12 }]} pointerEvents="none" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader 
        title="¿Qué zona exacta?"
        onBackPress={() => handleSelection('back')}
        onLayoutBack={(e) => {
          cardRefs.current['back'] = e.target;
          measureElement('back');
        }}
        isBackActive={activeZone === 'back'}
      />
      <View style={styles.header}>
        <Text style={styles.title}>Pie</Text>
        <Text style={styles.subtitle}>Toca o parpadea para seleccionar</Text>
      </View>

      <View style={styles.grid}>
        {options.map((option) => {
          const isActive = activeZone === option.id;
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
                styles.cardLarge,
                { borderColor: "#EA580C" }, 
                isActive && { backgroundColor: '#EA580C', borderColor: '#a53f09' }
              ]}
            >
              <View style={[styles.iconContainer, { height: 80 }]}>
                {IconComponent && <IconComponent fill={isActive ? '#FFFFFF' : '#111827'} width={80} height={80} />}
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
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 10 },
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
  iconContainer: { 
    marginBottom: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  cardTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 10 },
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

export default FootDetailScreen;