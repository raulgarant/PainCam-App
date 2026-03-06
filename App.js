import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import ZonesScreen from "./screens/ZonesScreen";
import HeadScreen from "./screens/HeadScreen"
import TrackingScreen from "./screens/TrackingScreen"

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Zones" component={ZonesScreen} />
        <Stack.Screen name="Head" component={HeadScreen} />
        <Stack.Screen name="Tracking" component={TrackingScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}