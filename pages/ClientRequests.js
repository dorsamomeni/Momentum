import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

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
        {clients.map((client, index) => (
          <View key={index} style={styles.requestContainer}>
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

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  /* Logic to accept request */
                }}
              >
                <Icon name="checkmark-outline" size={18} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  /* Logic to reject request */
                }}
              >
                <Icon name="close-outline" size={18} color="#000" />
              </TouchableOpacity>
            </View>
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
});

export default ClientRequests;
