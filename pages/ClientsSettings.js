import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSettings } from '../contexts/SettingsContext';

const ClientsSettings = () => {
  const navigation = useNavigation();
  const { weightUnit, toggleWeightUnit } = useSettings();

  const handleChangePhoto = () => {
    // Add photo change logic here
  };

  const handleLogout = () => {
    navigation.navigate("SignIn");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingsContainer}>
        {/* Weight Unit Option */}
        <TouchableOpacity
          style={styles.settingOption}
          onPress={toggleWeightUnit}
        >
          <View style={styles.optionLeft}>
            <Icon name="barbell-outline" size={24} color="#000" />
            <Text style={styles.optionText}>Weight Unit ({weightUnit.toUpperCase()})</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingOption}
          onPress={handleChangePhoto}
        >
          <View style={styles.optionLeft}>
            <Icon name="camera-outline" size={24} color="#000" />
            <Text style={styles.optionText}>Change Profile Photo</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingOption, styles.logoutOption]}
          onPress={handleLogout}
        >
          <View style={styles.optionLeft}>
            <Icon name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },
  settingsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 100,
  },
  settingOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#000",
  },
  logoutOption: {
    borderBottomWidth: 0,
    marginTop: 0,
  },
  logoutText: {
    color: "#FF3B30",
  },
  optionSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  toggleText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default ClientsSettings;
