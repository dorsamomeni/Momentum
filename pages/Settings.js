import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth } from "../src/config/firebase";
import { useSettings } from "../contexts/SettingsContext";

const Settings = () => {
  console.log("Settings component rendering");

  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { weightUnit, toggleWeightUnit } = useSettings();

  useEffect(() => {
    console.log("Settings useEffect running");
    const loadUserData = () => {
      const user = auth.currentUser;
      console.log("Current user in Settings:", user);
      
      if (user) {
        setUserName(user.displayName || "User");
        setUserEmail(user.email || "");
        console.log("User data set:", { userName: user.displayName, userEmail: user.email });
      }
    };

    loadUserData();
    const unsubscribe = auth.onAuthStateChanged(loadUserData);
    return () => unsubscribe();
  }, []);

  // Add this console log to see what's being rendered
  console.log("Rendering Settings with:", { userName, userEmail });

  return (
    <View style={[styles.container, { backgroundColor: '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* User Header Section */}
      <View style={styles.userHeader}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>

      {/* Make debug view full width */}
      <View style={[styles.debugView, { margin: 0, borderRadius: 0 }]}>
        <Text style={[styles.debugText, { fontSize: 18 }]}>Debug Info:</Text>
        <Text style={styles.debugText}>Name: {userName || "No name set"}</Text>
        <Text style={styles.debugText}>Email: {userEmail || "No email set"}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Account Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{userName || "Loading..."}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userEmail}</Text>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Account Created</Text>
            <Text style={styles.infoValue}>
              {auth.currentUser?.metadata?.creationTime 
                ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Weight Unit Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.option} onPress={toggleWeightUnit}>
            <Text style={styles.optionText}>
              Currently using {weightUnit.toUpperCase()}
            </Text>
            <Text style={styles.optionHint}>
              Tap to switch to {weightUnit === "kg" ? "LBS" : "KG"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <TouchableOpacity style={styles.option}>
            <View style={styles.optionRow}>
              <Text style={styles.optionText}>Change Profile Photo</Text>
              <Icon name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
    marginLeft: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  option: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  optionHint: {
    fontSize: 14,
    color: "#666",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
  },
  debugView: {
    padding: 15,
    backgroundColor: '#ffeb3b',
    margin: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    zIndex: 999,
  },
  debugText: {
    fontSize: 16,
    color: '#000',
    marginVertical: 2,
  },
  userHeader: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
});

export default Settings;
