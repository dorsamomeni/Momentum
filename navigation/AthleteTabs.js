import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/FontAwesome";
import AthleteHome from "../pages/AthleteHome";
import WorkoutProgram from "../pages/WorkoutProgram";
import AthleteStats from "../pages/AthleteStats";
import ClientsSettings from "../pages/ClientsSettings";
import FindCoach from "../pages/FindCoach";
import { TouchableOpacity, StyleSheet } from "react-native";
import { auth, db } from "../src/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { LogBox } from "react-native";
import CustomTabBarButton from "../components/CustomTabBarButton";

// Ignore specific yellow box warnings
LogBox.ignoreLogs(["Warning: ..."]);
LogBox.ignoreAllLogs();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AthleteStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AthleteHome" component={AthleteHome} />
      <Stack.Screen name="WorkoutProgram" component={WorkoutProgram} />
    </Stack.Navigator>
  );
};

const AthleteTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "flex" },
        tabBarLabelStyle: { display: "none" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={AthleteStack}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Icon name="home" size={24} color="#000" />
            </CustomTabBarButton>
          ),
        }}
      />

      <Tab.Screen
        name="Stats"
        component={AthleteStats}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Icon name="bar-chart-o" size={24} color="#000" />
            </CustomTabBarButton>
          ),
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={ClientsSettings}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Icon name="cog" size={24} color="#000" />
            </CustomTabBarButton>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    marginHorizontal: 5,
  },
});

export default AthleteTabs;
