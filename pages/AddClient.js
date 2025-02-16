import React, { useState } from "react";
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
import { collection, query, where, getDocs } from "firebase/firestore";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../src/config/firebase";

const AddClient = () => {
  const navigation = useNavigation();
  const [username, setUsername] = React.useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchAthletes = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const q = query(
        collection(db, "users"),
        where("role", "==", "athlete"),
        where("username", ">=", searchTerm.toLowerCase()),
        where("username", "<=", searchTerm.toLowerCase() + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const athletes = [];
      querySnapshot.forEach((doc) => {
        const athleteData = doc.data();
        if (!athleteData.coachId) {
          // Only show unassigned athletes
          athletes.push({
            id: doc.id,
            ...athleteData,
          });
        }
      });
      setSearchResults(athletes);
    } catch (error) {
      console.error("Error searching athletes:", error);
      Alert.alert("Error", "Failed to search athletes");
    } finally {
      setSearching(false);
    }
  };

  const handleAddAthlete = async (athleteId) => {
    try {
      const coachId = auth.currentUser.uid;

      // Update athlete document
      const athleteRef = doc(db, "users", athleteId);
      await updateDoc(athleteRef, {
        coachId: coachId,
        status: "active",
      });

      // Update coach's athletes array
      const coachRef = doc(db, "users", coachId);
      await updateDoc(coachRef, {
        athletes: arrayUnion(athleteId),
      });

      Alert.alert("Success", "Athlete added successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding athlete:", error);
      Alert.alert("Error", "Failed to add athlete");
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
      <Text style={styles.title}>Add Client</Text>

      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search athletes by username"
          placeholderTextColor="#666"
          autoCapitalize="none"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            searchAthletes(text);
          }}
          onSubmitEditing={() => {}}
          returnKeyType="search"
        />
      </View>

      <ScrollView style={styles.resultsContainer}>
        {searchResults.map((athlete) => (
          <TouchableOpacity
            key={athlete.id}
            style={styles.athleteCard}
            onPress={() => handleAddAthlete(athlete.id)}
          >
            <Text style={styles.athleteName}>
              {athlete.firstName} {athlete.lastName}
            </Text>
            <Text style={styles.athleteUsername}>@{athlete.username}</Text>
          </TouchableOpacity>
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
  },
  athleteName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  athleteUsername: {
    fontSize: 16,
    color: "#666",
  },
});

export default AddClient;
