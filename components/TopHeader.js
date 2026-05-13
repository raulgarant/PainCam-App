// components/TopHeader.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBlink } from '../BlinkContext';

const TopHeader = () => {
  const navigation = useNavigation();
  const { isFaceDetected } = useBlink();

  return (
    <View style={styles.topBarContainer}>

      <View style={[styles.sensorCircle, { backgroundColor: isFaceDetected ? "#D1FAE5" : "#FEE2E2" }]}>
        <Ionicons name="eye" size={22} color={isFaceDetected ? "#059669" : "#DC2626"} />
      </View>

      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={38} color="#1E293B" />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  topBarContainer: {
    position: "relative",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,

  },
  backButton: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sensorCircle: {
    width: 60,
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5
  }
});

export default TopHeader;