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
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../src/config/firebase";

const AddClient = () => {
  const navigation = useNavigation();
  const [username, setUsername] = React.useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isAthlete, setIsAthlete] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setIsAthlete(userData.role === "athlete");
      }
    };
    checkUserRole();
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

      if (isAthlete) {
        // Athlete sending request to coach
        const coachRef = doc(db, "users", userId);
        await updateDoc(coachRef, {
          pendingRequests: arrayUnion(currentUserId),
        });

        // Track sent request in athlete's document
        const athleteRef = doc(db, "users", currentUserId);
        await updateDoc(athleteRef, {
          sentRequests: arrayUnion(userId),
        });

        Alert.alert("Success", "Friend request sent to coach");
      } else {
        // Coach sending request to athlete
        const athleteRef = doc(db, "users", userId);
        await updateDoc(athleteRef, {
          coachRequests: arrayUnion(currentUserId),
        });

        // Track sent request in coach's document
        const coachRef = doc(db, "users", currentUserId);
        await updateDoc(coachRef, {
          sentRequests: arrayUnion(userId),
        });

        Alert.alert("Success", "Friend request sent to athlete");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error sending request:", error);
      Alert.alert("Error", "Failed to send request");
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
