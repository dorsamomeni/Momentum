import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ClientsList from "./ClientsList";
import ClientsStats from "./ClientsStats";
import ClientsSettings from "./ClientsSettings";
import ClientRequests from "./ClientRequests";
import { TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity style={styles.tabButton} onPress={onPress}>
    {children}
  </TouchableOpacity>
);

const ClientsTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "flex" },
        tabBarLabelStyle: { display: "none" },
      }}
    >
      <Tab.Screen
        name="Clients List"
        component={ClientsList}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Icon name="users" size={24} color="#000" />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen
        name="Client Requests"
        component={ClientRequests}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Icon name="envelope" size={24} color="#000" />
            </CustomTabBarButton>
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={ClientsStats}
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Icon name="bar-chart" size={24} color="#000" />
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

export default ClientsTabs;
