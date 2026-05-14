import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useBlink } from '../BlinkContext';
import { useIsFocused } from '@react-navigation/native'; 
import { Camera } from 'react-native-vision-camera'; 

export default function HomeScreen({ navigation }) {
  const { blinkTimestamp, isFaceDetected } = useBlink();
  const isFocused = useIsFocused();
  const lastProcessedBlink = useRef(blinkTimestamp);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      
      if (cameraPermission !== 'granted') {
        alert('⚠️ Se necesitan permisos de cámara para el rastreo facial.');
      }
    })();
  }, []);

  // Lógica de parpadeo (sin tocar)
  useEffect(() => {
    if (!isFocused) {
      lastProcessedBlink.current = blinkTimestamp;
      return;
    }

    if (blinkTimestamp > lastProcessedBlink.current) {
      lastProcessedBlink.current = blinkTimestamp;
      navigation.navigate('Calibration');
    }
  }, [blinkTimestamp, isFocused]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={[styles.statusBadge, { backgroundColor: isFaceDetected ? "#D1FAE5" : "#FEE2E2" }]}>
          <Ionicons name="eye" size={18} color={isFaceDetected ? "#059669" : "#DC2626"} />
          <Text style={[styles.statusText, { color: isFaceDetected ? "#059669" : "#DC2626" }]}>
            {isFaceDetected ? "Sensor Activo" : "Buscando rostro..."}
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Help")}>
          <Ionicons name="information-circle-sharp" size={26} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View style={styles.centerContainer}>
        {/* ICONO Y TÍTULO ALINEADOS */}
        <View style={styles.brandWrapper}>
          <Image 
            source={require('../assets/icon.png')} 
            style={styles.logoIcon} 
          />
          <Text style={styles.title}>PainCam</Text>
        </View>
        
        <Text style={styles.subtitle}>
          Comunica tu dolor{"\n"}a través de los ojos.
        </Text>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.hintText}>Parpadea para comenzar</Text>
        
        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Calibration")}
        >
          <Text style={styles.buttonText}>Empezar</Text>
          <View style={styles.iconCircle}>
            <Ionicons name="arrow-forward" size={24} color="#EA580C" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC", // Un gris muy claro/blanco azulado
    paddingVertical: 10 
  },
  topBar: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: 10, 
    paddingHorizontal: 24 
  },
  statusBadge: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20 
  },
  statusText: { 
    marginLeft: 8, 
    fontSize: 14, 
    fontWeight: "700" 
  },
  settingsButton: { 
    backgroundColor: "#FFFFFF", 
    padding: 10, 
    borderRadius: 15, 
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  brandWrapper: {
    flexDirection: "row", // Pone el icono al lado del texto
    alignItems: "center",
    marginBottom: 10
  },
  logoIcon: {
    width: 65, // Ajustado para que armonice con el texto
    height: 65,
    marginRight: 15,
    borderRadius: 14
  },
  title: { 
    fontSize: 54, 
    fontWeight: "900", 
    color: "#0F172A", 
    letterSpacing: -2 
  },
  subtitle: { 
    fontSize: 20, 
    color: "#475569", 
    lineHeight: 28, 
    textAlign: "center", 
    fontWeight: "500",
    marginTop: 10
  },
  footerContainer: {
    alignItems: "center",
    paddingBottom: 40
  },
  hintText: {
    fontSize: 18,
    color: "#94A3B8",
    marginBottom: 20,
    fontWeight: "600"
  },
  mainButton: { 
    flexDirection: "row", 
    backgroundColor: "#EA580C", 
    paddingVertical: 20, 
    paddingHorizontal: 35, 
    borderRadius: 40, 
    alignItems: "center", 
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#EA580C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12
  },
  buttonText: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#FFFFFF", 
    marginRight: 15 
  },
  iconCircle: { 
    backgroundColor: "#FFFFFF", 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: "center", 
    justifyContent: "center" 
  },
});