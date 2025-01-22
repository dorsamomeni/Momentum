import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const ClientRequests = () => {
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Client Requests</Text>

      {clients.map((client, index) => (
        <View key={index} style={styles.clientContainer}>
          <View
            style={[styles.profilePhoto, { backgroundColor: client.color }]}
          >
            <Text style={styles.initial}>{client.initial}</Text>
          </View>
          <View style={styles.clientInfoContainer}>
            <Text style={styles.clientName}>{client.name}</Text>
          </View>
          <View style={styles.symbolContainer}>
            <TouchableOpacity
              onPress={() => {
                /* Logic to accept request */
              }}
            >
              <Icon name="checkmark-circle-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                /* Logic to reject request */
              }}
            >
              <Icon
                name="close-circle-outline"
                size={24}
                color="#000"
                style={styles.rejectIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
  clientContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  initial: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  clientInfoContainer: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
  },
  symbolContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rejectIcon: {
    marginLeft: 5,
  },
});

export default ClientRequests;
