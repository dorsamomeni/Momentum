import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, db } from "../src/config/firebase";
import { doc, getDoc } from "firebase/firestore";

const ClientsList = () => {
  const navigation = useNavigation();
  const [clients, setClients] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Move loadClients outside of useEffect
  const loadClients = async () => {
    try {
      const coachId = auth.currentUser.uid;
      const coachDoc = await getDoc(doc(db, "users", coachId));
      const coachData = coachDoc.data();
      
      // Get the list of athlete IDs from both arrays
      const athleteIds = [
        ...(coachData.athletes || []),
        ...(coachData.clientList || []).map(client => client.athleteId)
      ];
      
      // Remove duplicates
      const uniqueAthleteIds = [...new Set(athleteIds)];
      
      // Fetch each athlete's details
      const athleteDetails = await Promise.all(
        uniqueAthleteIds.map(async (athleteId) => {
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
    }
  };

  // Initial load
  useEffect(() => {
    loadClients();
  }, []);

  // Reload when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadClients();
    }, [refreshKey])
  );

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("ClientRequests")}
          >
            <Icon name="add-circle" size={16} color="#000" />
            <Text style={styles.buttonText}>Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("AddClient")}
          >
            <Icon name="people" size={16} color="#000" />
            <Text style={styles.buttonText}>Add Client</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.clientsList}>
        {clients.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No clients yet</Text>
          </View>
        ) : (
          clients.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientContainer}
              onPress={() => navigation.navigate("ClientDetails", { client })}
            >
              <View style={styles.leftContainer}>
                <View
                  style={[styles.profilePhoto, { backgroundColor: "#A8E6CF" }]}
                >
                  <Text style={styles.initial}>
                    {client.firstName[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clientInfoContainer}>
                  <Text style={styles.clientName}>
                    {client.firstName} {client.lastName}
                  </Text>
                  <Text style={styles.username}>@{client.username}</Text>
                </View>
              </View>

              <View style={styles.rightContainer}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    /* Logic to remove client */
                  }}
                >
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#000",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "500",
  },
  clientsList: {
    flex: 1,
  },
  clientContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  initial: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  clientInfoContainer: {
    marginLeft: 16,
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  rightContainer: {
    marginLeft: 12,
  },
  removeButton: {
    width: 36,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default ClientsList;
