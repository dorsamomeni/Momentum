import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
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
          <TouchableOpacity style={styles.button}>
            <Icon name="people" size={16} color="#000" />
            <Text style={styles.buttonText}>Add Client</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Client Profile Section */}
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
                /* Logic to delete client */
              }}
            >
              <Image
                source={{
                  uri: "https://img.icons8.com/material/24/delete-sign--v1.png",
                }}
                style={styles.deleteIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                /* Logic to open person's program */
              }}
            >
              <Image
                source={{ uri: client.programLogo }}
                style={[styles.programLogo, { tintColor: "black" }]}
                onError={() =>
                  console.log(`Failed to load logo for ${client.name}`)
                } // Debugging
              />
            </TouchableOpacity>
            <Image
              source={{
                uri: "https://img.icons8.com/metro/26/uncheck-all.png",
              }} // Uncheck icon
              style={styles.uncheckIcon}
            />
          </View>
          <Image source={{ uri: client.logo }} style={styles.logo} />
        </View>
      ))}

      {/* I will add clients list logic here */}
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
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 0,
    paddingBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 35,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: "#000",
    fontSize: 14,
    marginLeft: 5,
  },
  clientContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  clientInfoContainer: {
    marginRight: 10,
  },
  symbolContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteIcon: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  programLogo: {
    width: 20,
    height: 20,
    marginRight: 2,
  },
  uncheckIcon: {
    width: 20,
    height: 20,
  },
  initial: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  clientName: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  logo: {
    width: 20,
    height: 20,
  },
});

export default ClientsList;
