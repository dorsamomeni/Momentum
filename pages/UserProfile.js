import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

const UserProfile = ({ route }) => {
  const navigation = useNavigation();
  const { username } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>User Profile</Text>

      <View style={styles.profileContainer}>
        <View style={styles.profilePhoto}>
          <Text style={styles.initial}>{username[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{username}</Text>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Client</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => navigation.navigate("Settings")}
      >
        <Text style={styles.settingsButtonText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 40,
    paddingTop: 140,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 100,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  profileContainer: {
    alignItems: "center",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#A8E6CF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  initial: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  username: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 40,
  },
  addButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 25,
    width: "80%",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  settingsButton: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginTop: 16,
  },
  settingsButtonText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
  },
});

export default UserProfile;
