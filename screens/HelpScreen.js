import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TutorialScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>❌ Cerrar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Guía de Uso</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <View style={styles.instructionRow}>
            <Text style={styles.icon}>👀</Text>
            <View style={styles.textContainer}>
              <Text style={styles.instructionTitle}>1. Mira a la pantalla</Text>
              <Text style={styles.instructionDesc}>
                Mueve tus ojos para desplazar el cursor azul por la pantalla.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.instructionRow}>
            <Text style={styles.icon}>😌</Text>
            <View style={styles.textContainer}>
              <Text style={styles.instructionTitle}>2. Parpadea para elegir</Text>
              <Text style={styles.instructionDesc}>
                Cuando el cursor esté sobre la opción que quieres, cierra los ojos un instante para seleccionarla (hacer clic).
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.instructionRow}>
            <Text style={styles.icon}>📱</Text>
            <View style={styles.textContainer}>
              <Text style={styles.instructionTitle}>3. Posicionamiento</Text>
              <Text style={styles.instructionDesc}>
                Coloca la tablet frente al paciente. Asegúrate de que la cámara frontal apunte directamente a su rostro.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.instructionRow}>
            <Text style={styles.icon}>💡</Text>
            <View style={styles.textContainer}>
              <Text style={styles.instructionTitle}>4. Iluminación</Text>
              <Text style={styles.instructionDesc}>
                Evita reflejos o luces fuertes justo detrás del paciente (contraluz). Una buena iluminación frontal mejora drásticamente la precisión del sensor.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.instructionRow}>
            <Text style={styles.icon}>🎯</Text>
            <View style={styles.textContainer}>
              <Text style={styles.instructionTitle}>5. Calibración</Text>
              <Text style={styles.instructionDesc}>
                Antes de empezar el reporte, se le pedirá al paciente que realice una calibración del cursor. En esta lo único que tendrá que hacer el paciente será mirar los círculos que irán apareciendo por la pantalla automáticamente. Tras esto comenzará el reporte del dolor.
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF0F2' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 15,
    paddingBottom: 20
  },
  backButton: { 
    backgroundColor: '#FFF', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  backButtonText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 3, 
    borderColor: '#EA580C', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 10
  },
  
  instructionRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  icon: { 
    fontSize: 45, 
    marginRight: 20 
  },
  textContainer: { 
    flex: 1 
  },
  instructionTitle: { 
    fontSize: 19, 
    fontWeight: 'bold', 
    color: '#111827',
    marginBottom: 5
  },
  instructionDesc: { 
    fontSize: 16, 
    color: '#6B7280',
    lineHeight: 22
  },
  
  divider: { 
    height: 1, 
    backgroundColor: '#E5E7EB', 
    marginVertical: 20 
  }
});

export default TutorialScreen;