import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons";
import AthleteHome from "../screens/athlete/Home";
import CoachHome from "../screens/coach/Home";
import Analytics from "../screens/common/Analytics";
import FindCoach from "../screens/athlete/FindCoach";
import Settings from "../screens/common/Settings";
import { auth } from "../config/firebase";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const userRole = auth.currentUser?.role;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Analytics") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "Find Coach") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={userRole === "coach" ? CoachHome : AthleteHome}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Analytics"
        component={Analytics}
        options={{ headerShown: false }}
      />
      {userRole !== "coach" && (
        <Tab.Screen
          name="Find Coach"
          component={FindCoach}
          options={{ headerShown: false }}
        />
      )}
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
