import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const ClientDetails = ({ route }) => {
  const navigation = useNavigation();
  const { client } = route.params;

  // Convert mock data to state
  const [currentBlock, setCurrentBlock] = useState({
    id: 1,
    name: "Strength Block",
    startDate: "Mar 1, 2024",
    endDate: "Mar 28, 2024",
    status: "active",
    sessionsPerWeek: 3,
  });
  
  const [previousBlocks, setPreviousBlocks] = useState([
    {
      id: 2,
      name: "Hypertrophy Block",
      startDate: "Feb 1, 2024",
      endDate: "Feb 28, 2024",
      status: "completed",
      sessionsPerWeek: 4,
    },
    {
      id: 3,
      name: "Endurance Block",
      startDate: "Jan 1, 2024",
      endDate: "Jan 28, 2024",
      status: "completed",
      sessionsPerWeek: 3,
    },
  ]);

  const handleNewBlock = (blockName, sessionsPerWeek) => {
    // Move current block to previous blocks if it exists
    if (currentBlock) {
      setPreviousBlocks([
        {
          ...currentBlock,
          status: "completed"
        },
        ...previousBlocks,
      ]);
    }

    // Create new block
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 28); // 4 weeks from today

    const newBlock = {
      id: Date.now(), // Use timestamp as temporary id
      name: blockName,
      startDate: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: "active",
      sessionsPerWeek,
    };

    setCurrentBlock(newBlock);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.header}>
          <View 
            style={[styles.profilePhoto, { backgroundColor: client.color }]}
          >
            <Text style={styles.initial}>{client.initial}</Text>
          </View>
          <Text style={styles.title}>{client.name}</Text>
          <TouchableOpacity 
            style={styles.newBlockButton}
            onPress={() => {
              navigation.navigate("CreateBlock", { 
                client,
                onCreateBlock: handleNewBlock 
              });
            }}
          >
            <Text style={styles.newBlockText}>New Block</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.blocksSection}>
          <Text style={styles.sectionTitle}>Current Block</Text>
          <TouchableOpacity
            style={styles.blockCard}
            onPress={() => navigation.navigate("WorkoutProgram", { block: currentBlock })}
          >
            <View style={styles.blockHeader}>
              <Text style={styles.blockName}>{currentBlock.name}</Text>
              <View style={styles.statusBadge}>
                <Icon name="radio-button-on" size={16} color="#4CAF50" />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
            <Text style={styles.dateText}>
              {currentBlock.startDate} - {currentBlock.endDate}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, styles.previousTitle]}>Previous Blocks</Text>
          {previousBlocks.map((block) => (
            <TouchableOpacity
              key={block.id}
              style={styles.blockCard}
              onPress={() => navigation.navigate("WorkoutProgram", { block })}
            >
              <View style={styles.blockHeader}>
                <Text style={styles.blockName}>{block.name}</Text>
                <View style={styles.statusBadge}>
                  <Icon name="checkmark-circle" size={16} color="#666" />
                  <Text style={[styles.statusText, styles.completedText]}>
                    Completed
                  </Text>
                </View>
              </View>
              <Text style={styles.dateText}>
                {block.startDate} - {block.endDate}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  initial: {
    color: "#fff", 
    fontSize: 48,
    fontWeight: "bold",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
  },
  blocksSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  previousTitle: {
    marginTop: 30,
  },
  blockCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  blockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  blockName: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  completedText: {
    color: "#666",
  },
  dateText: {
    color: "#666",
    fontSize: 14,
  },
  newBlockButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 15,
  },
  newBlockText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ClientDetails; 