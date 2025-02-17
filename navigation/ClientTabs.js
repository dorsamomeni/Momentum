import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";
import ClientList from "../pages/ClientList";
import AthleteHome from "../pages/AthleteHome";
import ClientDetails from "../pages/ClientDetails";
import WorkoutProgram from "../pages/WorkoutProgram";
import CreateBlock from "../pages/CreateBlock";
import ClientStats from "../pages/ClientStats";
import ClientsSettings from "../pages/ClientsSettings";
import { auth, db } from "../src/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { LogBox } from "react-native";
import ClientRequests from "../pages/ClientRequests";
import AddClient from "../pages/AddClient";
import UserProfile from "../pages/UserProfile";

// Ignore specific yellow box warnings
LogBox.ignoreLogs(["Warning: ..."]); // Replace ... with the specific warning text
// Or ignore all yellow boxes
LogBox.ignoreAllLogs();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Shared stack for both coaches and athletes
const MainStack = () => {
  const [isAthlete, setIsAthlete] = React.useState(false);

  React.useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setIsAthlete(userData.role === "athlete");
      }
    };
    checkUserRole();
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MainList"
        component={isAthlete ? AthleteHome : ClientList}
      />
      <Stack.Screen name="ClientDetails" component={ClientDetails} />
      <Stack.Screen name="WorkoutProgram" component={WorkoutProgram} />
      <Stack.Screen name="CreateBlock" component={CreateBlock} />
      <Stack.Screen name="ClientRequests" component={ClientRequests} />
      <Stack.Screen name="AddClient" component={AddClient} />
      <Stack.Screen name="UserProfile" component={UserProfile} />
    </Stack.Navigator>
  );
};

const ClientTabs = () => {
  const [isAthlete, setIsAthlete] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setIsAthlete(userData.role === "athlete");
      }
    };
    checkUserRole();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Stats") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={MainStack}
        options={{
          title: isAthlete ? "My Progress" : "Clients",
        }}
      />
      <Tab.Screen name="Stats" component={ClientStats} />
      <Tab.Screen name="Settings" component={ClientsSettings} />
    </Tab.Navigator>
  );
};

export default ClientTabs;
