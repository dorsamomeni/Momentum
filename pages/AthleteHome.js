import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../src/config/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";

const AthleteHome = () => {
  const navigation = useNavigation();
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [previousBlocks, setPreviousBlocks] = useState([]);
  const [userData, setUserData] = useState(null);
  const [coachData, setCoachData] = useState(null);

  console.log("AthleteHome component rendering");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const data = userDoc.data();
          setUserData(data);
          setActiveBlocks(data.activeBlocks || []);
          setPreviousBlocks(data.previousBlocks || []);

          // Fetch coach data if coachId exists
          if (data.coachId) {
            const coachDoc = await getDoc(doc(db, "users", data.coachId));
            if (coachDoc.exists()) {
              setCoachData({
                id: data.coachId,
                ...coachDoc.data(),
              });
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const handleRemoveCoach = async () => {
    try {
      const athleteId = auth.currentUser.uid;
      const coachId = userData.coachId;

      // Update athlete document
      const athleteRef = doc(db, "users", athleteId);
      await updateDoc(athleteRef, {
        coachId: null,
        status: "inactive",
        sentRequests: arrayRemove(coachId),
        coachRequests: arrayRemove(coachId),
      });

      // Update coach document
      const coachRef = doc(db, "users", coachId);
      await updateDoc(coachRef, {
        athletes: arrayRemove(athleteId),
        pendingRequests: arrayRemove(athleteId),
        sentRequests: arrayRemove(athleteId),
      });

      // Update local state
      setCoachData(null);
      setUserData((prev) => ({
        ...prev,
        coachId: null,
        sentRequests: prev.sentRequests?.filter((id) => id !== coachId) || [],
        coachRequests: prev.coachRequests?.filter((id) => id !== coachId) || [],
      }));
    } catch (error) {
      console.error("Error removing coach:", error);
      Alert.alert("Error", "Failed to remove coach");
    }
  };

  const renderBlock = (block, isPrevious = false) => (
    <TouchableOpacity
      key={block.id}
      style={[styles.blockCard, isPrevious && styles.previousBlock]}
      onPress={() =>
        navigation.navigate("WorkoutProgram", {
          block,
          onCloseBlock: () => {}, // Add close block functionality
          isPreviousBlock: isPrevious,
          onReopenBlock: () => {}, // Add reopen block functionality
          isAthlete: true,
        })
      }
    >
      <Text style={styles.blockName}>{block.name}</Text>
      <View style={styles.blockDetails}>
        <Text style={styles.blockDate}>
          {block.startDate} - {block.endDate}
        </Text>
        <Text style={styles.sessionsPerWeek}>
          {block.sessionsPerWeek} sessions/week
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Programs</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("CoachRequests")}
          >
            <Icon name="add-circle" size={16} color="#000" />
            <Text style={styles.buttonText}>Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("AddClient")}
          >
            <Icon name="people" size={16} color="#000" />
            <Text style={styles.buttonText}>Add Coach</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.coachSection}>
        <Text style={styles.sectionTitle}>Coach</Text>
        {coachData ? (
          <View style={styles.coachCard}>
            <View style={styles.coachHeader}>
              <View style={styles.coachInfo}>
                <View
                  style={[styles.profilePhoto, { backgroundColor: "#A8E6CF" }]}
                >
                  <Text style={styles.initial}>
                    {coachData.firstName[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.coachDetails}>
                  <Text style={styles.coachName}>
                    {coachData.firstName} {coachData.lastName}
                  </Text>
                  <Text style={styles.coachUsername}>
                    @{coachData.username}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={handleRemoveCoach}
              >
                <Icon name="close-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noCoachContainer}>
            <Text style={styles.noCoachText}>
              Connect with a coach to get started
            </Text>
            <TouchableOpacity
              style={styles.addCoachButton}
              onPress={() => navigation.navigate("AddClient")}
            >
              <Text style={styles.addCoachButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {activeBlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Programs</Text>
            {activeBlocks.map((block) => renderBlock(block))}
          </View>
        )}

        {previousBlocks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous Programs</Text>
            {previousBlocks.map((block) => renderBlock(block, true))}
          </View>
        )}

        {coachData &&
          activeBlocks.length === 0 &&
          previousBlocks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No programs available</Text>
            </View>
          )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 120,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000",
  },
  blockCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  previousBlock: {
    opacity: 0.7,
  },
  blockName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  blockDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  blockDate: {
    fontSize: 14,
    color: "#666",
  },
  sessionsPerWeek: {
    fontSize: 14,
    color: "#666",
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
  coachSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  coachCard: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  coachHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  coachInfo: {
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
  coachDetails: {
    marginLeft: 16,
    flex: 1,
  },
  coachName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  coachUsername: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 4,
  },
  noCoachContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  noCoachText: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  addCoachButton: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  addCoachButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default AthleteHome;
