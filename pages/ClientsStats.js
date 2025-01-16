import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ClientsStats = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clients Stats</Text>
      {/* I will add stats logic here */}
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

export default ClientsStats;
