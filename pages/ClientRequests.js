import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../src/config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const ClientRequests = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          // Get pending athlete requests
          const pendingRequests = userData.pendingRequests || [];
          const sentRequests = userData.sentRequests || [];

          // Fetch athlete details for each request
          const requestDetails = await Promise.all(
            pendingRequests.map(async (athleteId) => {
              const athleteDoc = await getDoc(doc(db, "users", athleteId));
              return {
                id: athleteId,
                ...athleteDoc.data(),
              };
            })
          );

          setRequests(requestDetails);
        }
      } catch (error) {
        console.error("Error loading requests:", error);
      }
    };

    loadRequests();
  }, []);

  const handleAcceptRequest = async (athleteId) => {
    try {
      const coachId = auth.currentUser.uid;

      // Update coach document
      const coachRef = doc(db, "users", coachId);
      await updateDoc(coachRef, {
        athletes: arrayUnion(athleteId),
        pendingRequests: arrayRemove(athleteId),
      });

      // Update athlete document
      const athleteRef = doc(db, "users", athleteId);
      await updateDoc(athleteRef, {
        coachId: coachId,
        status: "active",
      });

      // Remove request from local state
      setRequests(requests.filter((req) => req.id !== athleteId));

      Alert.alert("Success", "Client request accepted");
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept request");
    }
  };

  const handleRejectRequest = async (athleteId) => {
    try {
      const coachRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(coachRef, {
        pendingRequests: arrayRemove(athleteId),
      });

      // Remove request from local state
      setRequests(requests.filter((req) => req.id !== athleteId));

      Alert.alert("Success", "Request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      Alert.alert("Error", "Failed to reject request");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Client Requests</Text>
      </View>

      <ScrollView style={styles.requestsList}>
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No pending requests</Text>
          </View>
        ) : (
          requests.map((athlete) => (
            <View key={athlete.id} style={styles.requestContainer}>
              <View style={styles.leftContainer}>
                <View
                  style={[styles.profilePhoto, { backgroundColor: "#A8E6CF" }]}
                >
                  <Text style={styles.initial}>
                    {athlete.firstName[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clientInfoContainer}>
                  <Text style={styles.clientName}>
                    {athlete.firstName} {athlete.lastName}
                  </Text>
                  <Text style={styles.username}>@{athlete.username}</Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAcceptRequest(athlete.id)}
                >
                  <Icon name="checkmark-outline" size={18} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRejectRequest(athlete.id)}
                >
                  <Icon name="close-outline" size={18} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
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
    marginBottom: 30,
  },
  backButton: {
    marginRight: 20,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  requestsList: {
    flex: 1,
  },
  requestContainer: {
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
  username: {
    fontSize: 14,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
  },
});

export default ClientRequests;
