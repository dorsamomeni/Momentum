import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import ClientList from '../pages/ClientList';
import ClientDetails from '../pages/ClientDetails';
import WorkoutProgram from '../pages/WorkoutProgram';
import CreateBlock from '../pages/CreateBlock';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Create a stack that includes all client-related screens
const ClientStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClientList" component={ClientList} />
      <Stack.Screen name="ClientDetails" component={ClientDetails} />
      <Stack.Screen name="WorkoutProgram" component={WorkoutProgram} />
      <Stack.Screen name="CreateBlock" component={CreateBlock} />
    </Stack.Navigator>
  );
};

const ClientTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Clients") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "Stats") {
            iconName = focused ? "stats-chart" : "stats-chart-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen 
        name="Clients" 
        component={ClientStack}
        options={{
          tabBarVisible: true,
        }}
      />
      <Tab.Screen name="Stats" component={Analytics} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};

export default ClientTabs; 