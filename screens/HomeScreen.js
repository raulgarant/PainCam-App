import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.statusBadge}>
          <Ionicons name="eye" size={18} color="#065F46" />
          <Text style={styles.statusText}>Sensor Activo</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Tracking")}>
          <Ionicons name="settings-outline" size={26} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>PainCam</Text>
        <Text style={styles.subtitle}>
          Comunica tu dolor{"\n"}a través de los ojos.
        </Text>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("Zones")}
        >
          <Text style={styles.buttonText}>Empezar</Text>
          <View style={styles.iconCircle}>
            <Ionicons name="arrow-forward" size={22} color="#1E3A8A" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9", justifyContent: "space-between", paddingVertical: 5 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingHorizontal: 24 },
  statusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#A7F3D0", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 },
  statusText: { marginLeft: 8, fontSize: 15, fontWeight: "700", color: "#065F46" },
  settingsButton: { backgroundColor: "#FFFFFF", padding: 10, borderRadius: 15, borderWidth: 1, borderColor: "#E2E8F0" },
  textContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  title: { fontSize: 58, fontWeight: "900", color: "#0F172A", letterSpacing: -2, textAlign: "center" },
  subtitle: { fontSize: 22, color: "#64748B", marginTop: 16, lineHeight: 32, textAlign: "center", fontWeight: "500" },
  buttonWrapper: { alignItems: "center", paddingBottom: 20, paddingHorizontal: 24 },
  mainButton: { flexDirection: "row", backgroundColor: "#1E3A8A", paddingVertical: 18, paddingHorizontal: 28, borderRadius: 35, alignItems: "center", justifyContent: "center", shadowColor: "#1E3A8A", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 6 },
  buttonText: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginRight: 16 },
  iconCircle: { backgroundColor: "#E6EFFB", width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});