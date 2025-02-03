import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const ClientsList = () => {
  const navigation = useNavigation();

  const clients = [
    {
      name: "Francis Holzworth",
      initial: "F",
      color: "#A8E6CF",
      logo: "https://example.com/logo1.png",
    },
    {
      name: "Kaylyn Yokel",
      initial: "K",
      color: "#FF8C94",
      logo: "https://example.com/logo2.png",
    },
    {
      name: "Kimberly Muro",
      initial: "K",
      color: "#FFD3B6",
      logo: "https://example.com/logo3.png",
    },
    {
      name: "Jack Sause",
      initial: "J",
      color: "#8ed3de",
      logo: "https://example.com/logo4.png",
    },
    {
      name: "Rebekkah Lafantano",
      initial: "R",
      color: "#D3CFCF",
      logo: "https://example.com/logo5.png",
    },
  ];

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
        {clients.map((client, index) => (
          <TouchableOpacity
            key={index}
            style={styles.clientContainer}
            onPress={() => navigation.navigate("ClientDetails", { client })}
          >
            <View style={styles.leftContainer}>
              <View
                style={[styles.profilePhoto, { backgroundColor: client.color }]}
              >
                <Text style={styles.initial}>{client.initial}</Text>
              </View>
              <View style={styles.clientInfoContainer}>
                <Text style={styles.clientName}>{client.name}</Text>
              </View>
            </View>

            <View style={styles.rightContainer}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  /* Logic to reject client */
                }}
              >
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
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
});

export default ClientsList;
