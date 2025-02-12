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
          if (route.name === 'ClientsTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AnalyticsTab') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
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
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
        },
        tabBarHideOnKeyboard: true,
        tabBarVisible: true,
      })}
    >
      <Tab.Screen 
        name="ClientsTab" 
        component={ClientStack}
        options={{
          tabBarLabel: 'Clients',
          unmountOnBlur: false,
        }}
      />
      <Tab.Screen 
        name="AnalyticsTab" 
        component={Analytics} 
        options={{
          tabBarLabel: 'Analytics',
        }}
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={Settings} 
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default ClientTabs; 