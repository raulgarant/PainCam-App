import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

import TopHeader from '../components/TopHeader';

import HeadNeckIcon from '../components/icons/HeadNeckIcon';
import ArmIcon from '../components/icons/ArmIcon';
import FrontTrunkIcon from '../components/icons/FrontTrunkIcon';
import BackTrunkIcon from '../components/icons/BackTrunkIcon';
import LegIcon from '../components/icons/LegIcon';

const ZonesScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { painData, updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [activeZone, setActiveZone] = useState(null);
  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  const options = useMemo(() => {
    const isFront = painData.vistaCuerpo === 'Delante';
    
    return [
      { id: 'Cabeza/Cuello', name: 'Cabeza y Cuello', type: 'svg', IconComponent: HeadNeckIcon },
      { 
        id: 'Tronco', 
        name: isFront ? 'Pecho y Abdomen' : 'Espalda', 
        type: 'svg', 
        IconComponent: isFront ? FrontTrunkIcon : BackTrunkIcon 
      },
      { id: 'Brazos', name: 'Brazos y Manos', type: 'svg', IconComponent: ArmIcon },
      { id: 'Piernas', name: 'Piernas y Pies', type: 'svg', IconComponent: LegIcon }
    ];
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

  // --- LÓGICA DE PARPADEO ---
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
      updatePainData('region', selected.id);
    
      if (selected.id === 'Brazos') {
          navigation.navigate('ArmDetail');
      } else if (selected.id === 'Piernas') {
          navigation.navigate('LegDetail');
      } else if (selected.id === 'Cabeza/Cuello') {
          navigation.navigate('HeadNeckDetail');
      } else if (selected.id === 'Tronco') {
          navigation.navigate('TrunkDetail');
      }
    }
  };

  // Renderizado dinámico del cursor según el tipo de dolor
  const renderCursor = () => {
    if (!calibratedCursor) return null;
    const { tipo } = painData;
    const { x, y } = calibratedCursor;
    
    return <View style={[styles.cursor, { left: x - 10, top: y - 10 }]} pointerEvents="none" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader/>
      <View style={styles.header}>
        <Text style={styles.title}>¿En qué región principal?</Text>
        <Text style={styles.subtitle}>Vista: Cuerpo por {painData.vistaCuerpo} - Tipo: {painData.tipo}</Text>
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
                { borderColor: "#EA580C" }, 
                isActive && { backgroundColor: '#EA580C',  } // Usamos tu naranja vibrant
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
  container: { flex: 1, backgroundColor: '#EEF0F2', padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 20 },
  card: { width: '48%', height: 230, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 4, backgroundColor: '#FFF' },
  icon: { fontSize: 50, marginBottom: 15 },
  cardTitle: { fontSize: 40, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 10 },
  textWhite: { color: '#FFF' },
  cursor: {
    position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(59, 130, 246, 0.8)', borderWidth: 2, borderColor: '#FFF', zIndex: 9999
  },
});

export default ZonesScreen;