import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { auth, db } from "../src/config/firebase";

const ClientStats = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Statistics</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total Workouts</Text>
          <Text style={styles.statValue}>0</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Active Blocks</Text>
          <Text style={styles.statValue}>0</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Completed Blocks</Text>
          <Text style={styles.statValue}>0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statsContainer: {
    padding: 20,
  },
  statCard: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statTitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default ClientStats;
