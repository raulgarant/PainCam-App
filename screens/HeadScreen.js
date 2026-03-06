import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function HeadScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Cabeza</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>¿Qué parte exacta?</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
          <View style={styles.iconCircle}>
            <Ionicons name="bandage-outline" size={32} color="#1E3A8A" />
          </View>
          <Text style={styles.cardText}>Cráneo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
          <View style={styles.iconCircle}>
            <Ionicons name="eye-outline" size={32} color="#1E3A8A" />
          </View>
          <Text style={styles.cardText}>Cara</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbox-ellipses-outline" size={32} color="#1E3A8A" />
          </View>
          <Text style={styles.cardText}>Cuello</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F1F5F9", paddingVertical: 20 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 20 },
  backButton: { backgroundColor: "#FFFFFF", padding: 10, borderRadius: 15, borderWidth: 1, borderColor: "#E2E8F0" },
  headerText: { fontSize: 18, fontWeight: "700", color: "#64748B" },
  textContainer: { alignItems: "center", paddingHorizontal: 24, marginBottom: 40 },
  title: { fontSize: 40, fontWeight: "900", color: "#0F172A", textAlign: "center", letterSpacing: -1 },
  cardsContainer: { flex: 1, paddingHorizontal: 24, gap: 20 },
  card: { flexDirection: "row", backgroundColor: "#FFFFFF", padding: 24, borderRadius: 24, alignItems: "center", shadowColor: "#1E3A8A", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  iconCircle: { backgroundColor: "#E6EFFB", width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginRight: 20 },
  cardText: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
});