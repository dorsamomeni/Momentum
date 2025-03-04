import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  getCoachAthletes,
  sendProgramToAthlete,
} from "../src/services/coachService";
import { auth } from "../src/config/firebase";

const SendProgram = ({ route }) => {
  const navigation = useNavigation();
  const { blockId } = route.params;
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const coachId = auth.currentUser.uid;
      const athletesList = await getCoachAthletes(coachId);
      setAthletes(athletesList);
    } catch (error) {
      console.error("Error fetching athletes:", error);
      Alert.alert("Error", "Failed to load athletes");
    } finally {
      setLoading(false);
    }
  };

  const handleSendProgram = async (athleteId) => {
    try {
      setSending(true);
      await sendProgramToAthlete(blockId, athleteId);
      Alert.alert("Success", "Program sent to athlete successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error sending program:", error);
      Alert.alert("Error", "Failed to send program to athlete");
    } finally {
      setSending(false);
    }
  };

  const renderAthlete = ({ item }) => (
    <TouchableOpacity
      style={styles.athleteCard}
      onPress={() => handleSendProgram(item.id)}
      disabled={sending}
    >
      <View style={styles.athleteInfo}>
        <Text style={styles.athleteName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.athleteUsername}>@{item.username}</Text>
      </View>
      <Icon name="arrow-forward" size={24} color="#000" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Send Program</Text>
      <Text style={styles.subtitle}>
        Select an athlete to send this program to
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : athletes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            You don't have any athletes yet
          </Text>
          <TouchableOpacity
            style={styles.addAthleteButton}
            onPress={() => navigation.navigate("AddClient")}
          >
            <Text style={styles.addAthleteButtonText}>Add Athlete</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={athletes}
          renderItem={renderAthlete}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.athletesList}
        />
      )}

      {sending && (
        <View style={styles.sendingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.sendingText}>Sending program...</Text>
        </View>
      )}
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
    left: 40,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  loader: {
    marginTop: 50,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  addAthleteButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addAthleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  athletesList: {
    paddingBottom: 20,
  },
  athleteCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 15,
  },
  athleteInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  athleteUsername: {
    fontSize: 14,
    color: "#666",
  },
  sendingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  sendingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
});

export default SendProgram;
