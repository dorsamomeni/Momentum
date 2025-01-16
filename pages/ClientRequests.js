import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ClientRequests = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client Requests</Text>
      {/* Additional logic for displaying client requests will added here later */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default ClientRequests;
