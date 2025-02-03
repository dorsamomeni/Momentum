import "react-native-gesture-handler";
import React, { useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AppIntroSlider from "react-native-app-intro-slider";
import OpeningScreen from "./pages/OpeningScreen";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Welcome from "./pages/Welcome";
import Clients from "./pages/Clients";
import ClientRequests from "./pages/ClientRequests";
import AddClient from "./pages/AddClient";
import UserProfile from "./pages/UserProfile";
import ClientDetails from "./pages/ClientDetails";
import CreateBlock from "./pages/CreateBlock";
import WorkoutProgram from "./pages/WorkoutProgram";

const slides = [
  {
    id: 1,
    title: "",
    description: "",
    image: require("./assets/onboard1.jpg"),
  },
  {
    id: 2,
    title: "Programming Made Simpler",
    description: "Create and view programs faster than ever",
    image: require("./assets/onboard1.jpg"),
  },
  {
    id: 3,
    title: "Progress made clearer",
    description: "Track performance in one place",
    image: require("./assets/onboard1.jpg"),
  },
];

const Stack = createStackNavigator();

export default function App() {
  const [showHomePage, setShowHomePage] = useState(false);

  const handleDone = () => {
    setShowHomePage(true);
  };

  const OnboardingScreen = () => {
    const buttonLabel = (label) => (
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>{label}</Text>
      </View>
    );

    return (
      <View style={styles.container}>
        <AppIntroSlider
          data={slides}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
          activeDotStyle={{
            backgroundColor: "#000",
            width: 30,
          }}
          showSkipButton
          renderNextButton={() => buttonLabel("Next")}
          renderSkipButton={() => buttonLabel("Skip")}
          renderDoneButton={() => buttonLabel("Done")}
          onDone={handleDone}
        />
      </View>
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={showHomePage ? "OpeningScreen" : "Onboarding"}
      >
        {!showHomePage ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="OpeningScreen"
              component={OpeningScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignIn"
              component={SignIn}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Welcome"
              component={Welcome}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Clients"
              component={Clients}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ClientRequests"
              component={ClientRequests}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddClient"
              component={AddClient}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfile}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ClientDetails"
              component={ClientDetails}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateBlock"
              component={CreateBlock}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WorkoutProgram"
              component={WorkoutProgram}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    paddingTop: 180,
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
    alignSelf: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    marginTop: -30,
  },
  description: {
    textAlign: "center",
    marginTop: 5,
  },
  buttonContainer: {
    padding: 12,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
