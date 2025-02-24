import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { collection, query, where, getDocs, getDoc } from "firebase/firestore";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../src/config/firebase";

const AddClient = () => {
  const navigation = useNavigation();
  const [username, setUsername] = React.useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isAthlete, setIsAthlete] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      setIsAthlete(userDoc.data()?.role === "athlete");
    };
    checkRole();
  }, []);

  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", isAthlete ? "coach" : "athlete"),
        where("username", ">=", searchTerm),
        where("username", "<=", searchTerm + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const currentUserId = auth.currentUser.uid;
        const alreadyConnected = isAthlete
          ? userData.athletes?.includes(currentUserId)
          : userData.coachId === currentUserId;
        const hasPendingRequest =
          userData.pendingRequests?.includes(currentUserId) ||
          userData.coachRequests?.includes(currentUserId);

        if (!alreadyConnected && !hasPendingRequest) {
          users.push({
            id: doc.id,
            ...userData,
          });
        }
      });
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleAddUser = async (userId) => {
    try {
      const currentUserId = auth.currentUser.uid;
      const batch = writeBatch(db);

      if (isAthlete) {
        // Athlete sending request to coach
        const athleteRef = doc(db, "users", currentUserId);
        const coachRef = doc(db, "users", userId);

        batch.update(athleteRef, {
          sentRequests: arrayUnion(userId),
        });

        batch.update(coachRef, {
          pendingRequests: arrayUnion(currentUserId),
        });

        await batch.commit();
        Alert.alert("Success", "Request sent to coach");
      } else {
        // Coach adding athlete (existing logic)
        const blockId = `block_${Date.now()}`;
        const initialBlock = {
          id: blockId,
          name: "Initial Program",
          startDate: new Date().toISOString(),
          endDate: new Date(
            Date.now() + 28 * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "active",
          sessionsPerWeek: 3,
          weeks: [
            {
              weekNumber: 1,
              exercises: Array(3)
                .fill()
                .map(() => ({
                  day: 1,
                  exercises: [],
                })),
            },
          ],
          coachId: currentUserId,
          athleteId: userId,
          createdAt: new Date().toISOString(),
        };

        const coachRef = doc(db, "users", currentUserId);
        const athleteRef = doc(db, "users", userId);

        batch.update(coachRef, {
          athletes: arrayUnion(userId),
          pendingRequests: arrayRemove(userId),
          sentRequests: arrayRemove(userId),
        });

        batch.update(athleteRef, {
          coachId: currentUserId,
          status: "active",
          sentRequests: arrayRemove(currentUserId),
          activeBlocks: arrayUnion(blockId),
        });

        const blockRef = doc(db, "blocks", blockId);
        batch.set(blockRef, initialBlock);

        await batch.commit();
        Alert.alert("Success", "Client added successfully");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Error sending request:", error);
      Alert.alert("Error", "Failed to add client. Please try again.");
    }
  };

  const handleSearch = () => {
    if (username.trim()) {
      navigation.navigate("UserProfile", { username: username.trim() });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{isAthlete ? "Add Coach" : "Add Client"}</Text>

      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${
            isAthlete ? "coaches" : "athletes"
          } by username`}
          placeholderTextColor="#666"
          autoCapitalize="none"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            searchUsers(text);
          }}
          onSubmitEditing={() => {}}
          returnKeyType="search"
        />
      </View>

      <ScrollView style={styles.resultsContainer}>
        {searchResults.map((user) => (
          <View key={user.id} style={styles.athleteCard}>
            <View style={styles.userInfo}>
              <Text style={styles.athleteName}>
                {user.firstName} {user.lastName}
              </Text>
              <Text style={styles.athleteUsername}>@{user.username}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddUser(user.id)}
            >
              <Icon name="add-circle-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        ))}
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 60,
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
  logo: {
    width: 180,
    height: 180,
    marginBottom: 0,
    marginTop: 40,
    alignSelf: "center",
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 0,
    width: "100%",
    alignSelf: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  resultsContainer: {
    flex: 1,
  },
  athleteCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  athleteUsername: {
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    padding: 8,
  },
});

export default AddClient;
