import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../src/config/firebase";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { testFirebaseSetup } from "../src/services/FirebaseService";

const ClientsList = () => {
  const navigation = useNavigation();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const coachId = auth.currentUser.uid;
        const coachDoc = await getDoc(doc(db, "users", coachId));
        const coachData = coachDoc.data();

        const athleteIds = coachData.athletes || [];

        const athleteDetails = await Promise.all(
          athleteIds.map(async (athleteId) => {
            const athleteDoc = await getDoc(doc(db, "users", athleteId));
            return {
              id: athleteId,
              ...athleteDoc.data(),
            };
          })
        );

        setClients(athleteDetails);
      } catch (error) {
        console.error("Error loading clients:", error);
        Alert.alert("Error", "Failed to load clients");
      }
    };

    loadClients();
  }, []);

  const handleRemoveClient = async (clientId) => {
    try {
      const coachId = auth.currentUser.uid;

      // Update coach document
      const coachRef = doc(db, "users", coachId);
      await updateDoc(coachRef, {
        athletes: arrayRemove(clientId),
      });

      // Update athlete document
      const athleteRef = doc(db, "users", clientId);
      await updateDoc(athleteRef, {
        coachId: null,
        status: "inactive",
      });

      // Update local state
      setClients(clients.filter((client) => client.id !== clientId));
      Alert.alert("Success", "Client removed successfully");
    } catch (error) {
      console.error("Error removing client:", error);
      Alert.alert("Error", "Failed to remove client");
    }
  };

  const handleTestFirebase = async () => {
    try {
      const result = await testFirebaseSetup();
      if (result) {
        Alert.alert("Success", "Firebase setup is working correctly!");
      } else {
        Alert.alert(
          "Error",
          "Firebase setup test failed. Check console for details."
        );
      }
    } catch (error) {
      console.error("Test error:", error);
      Alert.alert("Error", `Test failed: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Clients</Text>
          <View style={styles.buttonContainer}>
            {__DEV__ && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#f0ad4e" }]}
                onPress={handleTestFirebase}
              >
                <Icon name="bug" size={16} color="#fff" />
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  Test Firebase
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("ClientRequests")}
            >
              <Icon name="notifications" size={16} color="#000" />
              <Text style={styles.buttonText}>Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("AddClient")}
            >
              <Icon name="person-add" size={16} color="#000" />
              <Text style={styles.buttonText}>Add Client</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.clientsList}>
          {clients.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No clients yet</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("AddClient")}
              >
                <Text style={styles.addButtonText}>Add Your First Client</Text>
              </TouchableOpacity>
            </View>
          ) : (
            clients.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.clientCard}
                onPress={() => navigation.navigate("ClientDetails", { client })}
              >
                <View style={styles.clientInfo}>
                  <View style={styles.profilePhoto}>
                    <Text style={styles.initial}>
                      {client.firstName[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.name}>
                      {client.firstName} {client.lastName}
                    </Text>
                    <Text style={styles.username}>@{client.username}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => {
                    Alert.alert(
                      "Remove Client",
                      "Are you sure you want to remove this client?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Remove",
                          onPress: () => handleRemoveClient(client.id),
                          style: "destructive",
                        },
                      ]
                    );
                  }}
                >
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    marginTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  buttonText: {
    fontSize: 14,
  },
  clientsList: {
    flex: 1,
  },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  clientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A8E6CF",
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  textContainer: {
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  username: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#A8E6CF",
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ClientsList;
