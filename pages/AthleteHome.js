import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../src/config/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const AthleteHome = () => {
  const navigation = useNavigation();
  const [coachName, setCoachName] = useState("");
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [previousBlocks, setPreviousBlocks] = useState([]);

  console.log("AthleteHome component rendering");

  useEffect(() => {
    const checkUser = async () => {
      const user = auth.currentUser;
      console.log("Current user in AthleteHome:", user?.uid);

      if (!user) {
        console.log("No user found in AthleteHome");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        console.log("User document in AthleteHome:", userDoc.data());
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    checkUser();
  }, []);

  const fetchAthleteData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      if (userData.coachId) {
        const coachDoc = await getDoc(doc(db, "users", userData.coachId));
        const coachData = coachDoc.data();
        setCoachName(`${coachData.firstName} ${coachData.lastName}`);
      }

      // Get active blocks
      const activeBlocksQuery = query(
        collection(db, "blocks"),
        where("athleteId", "==", user.uid),
        where("status", "==", "active")
      );
      
      const activeBlocksSnapshot = await getDocs(activeBlocksQuery);
      const activeBlocksData = [];
      activeBlocksSnapshot.forEach((doc) => {
        activeBlocksData.push({ id: doc.id, ...doc.data() });
      });
      setActiveBlocks(activeBlocksData);

      // Get previous blocks
      const previousBlocksQuery = query(
        collection(db, "blocks"),
        where("athleteId", "==", user.uid),
        where("status", "==", "completed")
      );
      
      const previousBlocksSnapshot = await getDocs(previousBlocksQuery);
      const previousBlocksData = [];
      previousBlocksSnapshot.forEach((doc) => {
        previousBlocksData.push({ id: doc.id, ...doc.data() });
      });
      setPreviousBlocks(previousBlocksData);
    } catch (error) {
      console.error("Error fetching athlete data:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate("Settings")}
      >
        <Icon name="settings-outline" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>My Programs</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.placeholder}>Athlete view coming soon!</Text>
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
  settingsButton: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  header: {
    paddingTop: 100,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  placeholder: {
    fontSize: 18,
    color: "#666",
  },
});

export default AthleteHome; 