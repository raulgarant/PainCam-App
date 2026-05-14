import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';
import TopHeader from '../components/TopHeader';

const SpecificIntensityScreen = ({ navigation }) => {
  // 1. Usamos el nuevo sistema de cursor y timestamp
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { painData, updatePainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(0);

  const [activeZone, setActiveZone] = useState(null);

  // Referencias para las colisiones (Hit Testing)
  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 

  // Quitamos los 'directions' porque ahora usamos coordenadas físicas
  const options = useMemo(() => {
    switch (painData.rangoIntensidad) {
      case 'Leve':
        return [
          { id: 0, name: '0' },
          { id: 1, name: '1' },
          { id: 2, name: '2' },
          { id: 3, name: '3' },
          { id: 4, name: '4' },
        ];
      case 'Moderado':
        return [
          { id: 5, name: '5' },
          { id: 6, name: '6' },
          { id: 7, name: '7' },
        ];
      case 'Intenso':
        return [
          { id: 8, name: '8' },
          { id: 9, name: '9' },
          { id: 10, name: '10' },
        ];
      default:
        return [];
    }
  }, [painData.rangoIntensidad]);

  const getColor = () => {
    if (painData.rangoIntensidad === 'Leve') return '#10B981';
    if (painData.rangoIntensidad === 'Moderado') return '#F59E0B';
    return '#EF4444';
  };

  const themeColor = getColor();

  // Función que mide el tamaño físico de cada tarjeta
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
          foundZone = Number(id); // Convertimos el string a número para que coincida con el id
        }
      });
    }
    
    if (foundZone !== activeZone) setActiveZone(foundZone);
  }, [calibratedCursor, layouts, activeZone]);

  // --- LÓGICA DE PARPADEO CON ESCUDO DE ENFOQUE ---
  useEffect(() => {
    // Escudo: Si no estamos en esta pantalla, ignoramos y sincronizamos el tiempo
    if (!isFocused) {
      lastProcessedBlink.current = blinkTimestamp;
      return;
    }

    if (blinkTimestamp > lastProcessedBlink.current) {
      lastProcessedBlink.current = blinkTimestamp;
      
      // Aseguramos que haya una zona activa ( !== null porque el id 0 da falso en JS)
      if (activeZone !== null) {
        handleSelection(activeZone);
      }
    }
  }, [blinkTimestamp, isFocused, activeZone]);

  // --- NUEVA FUNCIÓN DE SELECCIÓN UNIFICADA ---
  const handleSelection = (id) => {

    if (id === 'back') {
      navigation.goBack();
      return;
    }

    const selected = options.find(o => o.id === id);
    if (selected) {
      updatePainData('numeroIntensidad', selected.id);
      navigation.navigate('Duration'); 
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopHeader />
      <View style={styles.header}>
        <Text style={styles.title}>Selecciona el número exacto</Text>
        <Text style={styles.subtitle}>Has elegido intensidad {painData.rangoIntensidad}. Parpadea o toca para seleccionar.</Text>
      </View>

      <View style={styles.grid}>
        {options.map((option) => {
          const isActive = activeZone === option.id;
          return (
            <TouchableOpacity 
              key={option.id} 
              activeOpacity={0.7}
              ref={el => cardRefs.current[option.id] = el}
              onLayout={() => measureElement(option.id)}
              onPress={() => handleSelection(option.id)} // Lógica táctil añadida
              style={[
                styles.card, 
                { borderColor: themeColor }, 
                isActive && { backgroundColor: themeColor },
                options.length === 5 ? styles.cardSmall : styles.cardLarge
              ]}
            >
              <Text style={[styles.cardTitle, isActive ? styles.textWhite : { color: themeColor }]}>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, width: '100%', paddingHorizontal: 10 },
  card: { borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, backgroundColor: '#FFF' },
  cardLarge: { flex: 1, height: 480, minWidth: '30%' },
  cardSmall: { width: '32%', height: 230 },
  cardTitle: { fontSize: 48, fontWeight: 'bold' },
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

export default SpecificIntensityScreen;