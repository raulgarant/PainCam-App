import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';
import { usePain } from '../PainContext';

// Importamos las librerías para la captura
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const SummaryScreen = ({ navigation }) => {
  const { blinkTimestamp, calibratedCursor } = useBlink();
  const { painData, resetPainData } = usePain();
  
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  const [activeZone, setActiveZone] = useState(null);
  const [layouts, setLayouts] = useState({}); 
  const cardRefs = useRef({}); 
  
  // Referencia para capturar la pantalla
  const viewRef = useRef();

  const actions = [
    { id: 'confirm', name: 'ENVIAR REPORTE', color: '#10B981', },
    { id: 'reset', name: 'REINICIAR', color: '#6B7280' }
  ];

  const getIntensityColor = (value) => {
    if (value >= 8) return '#EF4444';
    if (value >= 4) return '#F59E0B';
    return '#10B981';
  };

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
    actions.forEach(action => measureElement(action.id));
  }, []);

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
      if (activeZone) handleAction(activeZone);
    }
  }, [blinkTimestamp, isFocused, activeZone]);

  // Modificamos la acción para capturar la imagen
  const handleAction = async (id) => {
    if (id === 'confirm') {
      try {
        // Captura la vista
        const localUri = await captureRef(viewRef, {
          format: 'png',
          quality: 1,
        });

        await Sharing.shareAsync(localUri, {
          dialogTitle: 'Guardar resumen médico',
        });
        
        alert("¡Reporte guardado con éxito!");
        navigation.navigate('Home')
      } catch (e) {
        console.error("Error al capturar pantalla:", e);
        alert("Hubo un error al guardar la imagen.");
      }
    } else {
      resetPainData();
      navigation.navigate('Intensity');
    }
  };

  const formatLabel = (text) => {
    if (!text) return 'General';
    const dictionary = {
      'Cuello_Post': 'Cuello Posterior',
    };
    return dictionary[text] || text.replace(/_/g, ' ');
  };

  const getRegionDisplay = () => {
    const region = painData.region || '';
    const lado = painData.ladoExtremidad;
    if (!lado || lado === 'N/A') return region;

    const lowerRegion = region.toLowerCase();
    if (lowerRegion.includes('brazo')) return lado === 'Ambas' ? 'Ambos Brazos' : `Brazo ${lado === 'Izquierda' ? 'Izquierdo' : 'Derecho'}`;
    if (lowerRegion.includes('pierna')) return lado === 'Ambas' ? 'Ambas Piernas' : `Pierna ${lado}`;
    if (lowerRegion.includes('mano')) return lado === 'Ambas' ? 'Ambas Manos' : `Mano ${lado}`;
    if (lowerRegion.includes('pie')) return lado === 'Ambas' ? 'Ambos Pies' : `Pie ${lado === 'Izquierda' ? 'Izquierdo' : 'Derecho'}`;
    
    return `${region} ${lado}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Todo lo que esté dentro de este View saldrá en la foto */}
      <View ref={viewRef} collapsable={false} style={styles.captureContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Resumen Final</Text>
        </View>

        <View style={styles.mainGrid}>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Estado</Text>
            <View style={[styles.card, styles.cardFull, { alignItems: 'center' }]}>
              <View style={[styles.intensityCircle, { backgroundColor: getIntensityColor(painData.numeroIntensidad) }]}>
                <Text style={styles.intensityNumber}>{painData.numeroIntensidad}</Text>
              </View>
              <Text style={styles.labelCentered}>Intensidad del Dolor</Text>
              <Text style={styles.valueLargeCentered}>{painData.rangoIntensidad}</Text>
            </View>
            <View style={[styles.card, styles.cardFull, { alignItems: 'center' }]}>
              <Text style={styles.labelCentered}>Tipo de Dolor</Text>
              <Text style={styles.valueLargeCentered}>{painData.tipo}</Text>
              <Text style={styles.labelCentered}>Duración</Text>
              <Text style={styles.valueLargeCentered}>{painData.duracion}</Text>
            </View>
          </View>

          <View style={[styles.column, { flex: 2 }]}>
            <Text style={styles.columnTitle}>Ubicación y Detalles</Text>
            <View style={[styles.card, styles.cardFull, { alignItems: 'center' }]}>
                <Text style={styles.labelCentered}>Vista del Cuerpo</Text>
                <Text style={styles.valueCentered}>{painData.vistaCuerpo}</Text>
                
                <Text style={styles.labelCentered}>Región</Text>
                <Text style={styles.valueCentered}>{getRegionDisplay()}</Text>
                
                <Text style={styles.labelCentered}>Parte</Text>
                <Text style={styles.valueCentered}>{formatLabel(painData.subRegion)}</Text>
                
                {(painData.detalleMano || painData.detallePie) && (
                  <>
                    <Text style={styles.labelCentered}>Específico</Text>
                    <Text style={styles.valueCentered}>
                      {painData.detalleMano ? `Mano: ${painData.detalleMano.cara} - Dedo: ${painData.detalleMano.dedo}` : 
                       `Pie: ${painData.detallePie.cara} - Dedo: ${painData.detallePie.dedo}`}
                    </Text>
                  </>
                )}
            </View>

            {painData.tipo === 'Irradiado' && (
              <View style={[styles.card, styles.irradiadoCard]}>
                <Text style={styles.labelCentered}>Irradiación hacia</Text>
                <Text style={[styles.valueLargeCentered, { marginBottom: 0 }]}>{painData.destinoIrradiado}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {actions.map((action) => {
          const isActive = activeZone === action.id;
          return (
            <TouchableOpacity
              key={action.id}
              ref={el => cardRefs.current[action.id] = el}
              onLayout={() => measureElement(action.id)}
              onPress={() => handleAction(action.id)}
              style={[
                styles.actionButton,
                { borderColor: action.color },
                isActive && { backgroundColor: action.color },
                action.id === 'confirm' ? { flex: 2 } : { flex: 1 }
              ]}
            >
              <Text style={[styles.buttonText, isActive && { color: '#FFF' }]}>
                {action.name}
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
  container: { flex: 1, backgroundColor: '#EEF0F2', padding: 15 },
  captureContainer: { flex: 1, backgroundColor: '#EEF0F2', padding: 10, borderRadius: 10 }, // Contenedor de la foto
  header: { marginBottom: 15, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },
  
  mainGrid: { flex: 1, flexDirection: 'row', gap: 15 },
  column: { flex: 1, gap: 10 },
  columnTitle: { fontSize: 16, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', textAlign: 'center', marginBottom: 5},
  
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#EA580C', elevation: 2, justifyContent: 'center' },
  cardFull: { flex: 1 },
  irradiadoCard: { backgroundColor: '#FFF', borderColor: '#EA580C', flex: 0, paddingVertical: 20 },
  
  intensityCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  intensityNumber: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  
  labelCentered: { fontSize: 13, color: '#9CA3AF', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' },
  valueCentered: { fontSize: 24, color: '#1F2937', fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  valueLargeCentered: { fontSize: 24, color: '#1F2937', fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },

  footer: { flexDirection: 'row', gap: 15, marginTop: 15, height: 120 },
  actionButton: { borderRadius: 20, borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  buttonText: { fontSize: 28, fontWeight: 'bold', color: '#374151' },

  cursor: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(59, 130, 246, 0.8)', borderWidth: 2, borderColor: '#FFF', zIndex: 9999 }
});

export default SummaryScreen;