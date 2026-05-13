import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 1. Importamos los nuevos componentes de control global
import { BlinkProvider, useBlink } from './BlinkContext';
import { GlobalBlinkDetector } from './GlobalBlinkDetector';
import { PainProvider } from './PainContext';

// Tus pantallas actuales
import HomeScreen from "./screens/HomeScreen";
import HelpScreen from "./screens/HelpScreen"
import IntensityScreen from "./screens/IntensityScreen"
import SpecificIntensityScreen from "./screens/SpecificIntensityScreen";
import DurationScreen from "./screens/DurationScreen";
import TypeScreen from "./screens/TypeScreen"
import BodyMapScreen from "./screens/BodyMapScreen";
import ArmDetailScreen from "./screens/ArmDetailScreen";
import ZonesScreen from "./screens/ZonesScreen";
import RadiatingDestinationScreen from "./screens/RadiatingDestinationScreen"
import HandDetailScreen from "./screens/HandDetailScreen"
import LegDetailScreen from "./screens/LegDetailScreen";
import FootDetailScreen from "./screens/FootDetailScreen";
import TrunkDetailScreen from "./screens/TrunkDetailScreen"
import HeadNeckDetailScreen from "./screens/HeadNeckDetailScreen";
import CalibrationScreen from "./screens/CalibrationScreen";
import SummaryScreen from "./screens/SummaryScreen";

const Stack = createNativeStackNavigator();

/*
const GazePointer = () => {
  const { rawGaze, isFaceDetected, calibration } = useBlink();
  const { width, height } = Dimensions.get('window');

  if (!isFaceDetected) return null;

  // MAGIA MATEMÁTICA: Normalizamos el valor crudo usando los límites de calibración
  // Si el ojo mira al tope izquierdo (minX), el resultado será 0 (borde izquierdo de la pantalla)
  let normX = (rawGaze.x - calibration.minX) / (calibration.maxX - calibration.minX);
  let normY = (rawGaze.y - calibration.minY) / (calibration.maxY - calibration.minY);

  let pointerX = normX * width;
  let pointerY = normY * height;

  // Evitamos que el punto se salga de la pantalla físicamente
  pointerX = Math.max(0, Math.min(pointerX, width));
  pointerY = Math.max(0, Math.min(pointerY, height));

  return (
    <View
      style={{
        position: 'absolute',
        top: pointerY - 15,
        left: pointerX - 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
};


*/
export default function App() {
  return (
    <SafeAreaProvider>
      <BlinkProvider>
        <PainProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Help" component={HelpScreen} />
              <Stack.Screen name="Intensity" component={IntensityScreen} />
              <Stack.Screen name="SpecificIntensity" component={SpecificIntensityScreen} />
              <Stack.Screen name="Duration" component={DurationScreen} />
              <Stack.Screen name="Type" component={TypeScreen} />
              <Stack.Screen name="BodyMap" component={BodyMapScreen} />
              <Stack.Screen name="Zones" component={ZonesScreen} />
              <Stack.Screen name="ArmDetail" component={ArmDetailScreen} />
              <Stack.Screen name="RadiatingDestination" component={RadiatingDestinationScreen} />
              <Stack.Screen name="HandDetail" component={HandDetailScreen} />
              <Stack.Screen name="LegDetail" component={LegDetailScreen} />
              <Stack.Screen name="FootDetail" component={FootDetailScreen} />
              <Stack.Screen name="TrunkDetail" component={TrunkDetailScreen} />
              <Stack.Screen name="HeadNeckDetail" component={HeadNeckDetailScreen} />  
              <Stack.Screen name="Summary" component={SummaryScreen} />
              <Stack.Screen name="Calibration" component={CalibrationScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <GlobalBlinkDetector />
        </PainProvider>
      </BlinkProvider>
    </SafeAreaProvider>
  );
}

// npx expo run:android