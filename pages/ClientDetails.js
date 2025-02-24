import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../src/config/firebase";
import { writeBatch, doc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";

const ClientDetails = ({ route }) => {
  const navigation = useNavigation();
  const { client } = route.params;

  // Change currentBlock to activeBlocks array
  const [activeBlocks, setActiveBlocks] = useState([]);

  const [previousBlocks, setPreviousBlocks] = useState([
    {
      id: 2,
      name: "Volume Block",
      startDate: "Feb 1, 2024",
      endDate: "Feb 28, 2024",
      status: "completed",
      sessionsPerWeek: 4,
      weeks: [
        {
          exercises: [
            {
              // Day 1 - Squat Focus
              exercises: [
                {
                  name: "Competition Squat",
                  scheme: "5 x 5 @ RPE 7",
                  weight: "140",
                  notes: "2 count pause at bottom",
                },
                {
                  name: "Tempo Squat",
                  scheme: "3 x 5 @ RPE 6",
                  weight: "120",
                  notes: "3-1-0 tempo",
                },
                {
                  name: "Belt Squat",
                  scheme: "3 x 12",
                  weight: "80",
                  notes: "Focus on quad drive",
                },
              ],
            },
            {
              // Day 2 - Bench Focus
              exercises: [
                {
                  name: "Competition Bench",
                  scheme: "5 x 5 @ RPE 7",
                  weight: "100",
                  notes: "1 count pause",
                },
                {
                  name: "Close Grip Bench",
                  scheme: "4 x 8 @ RPE 7",
                  weight: "85",
                  notes: "Index finger on rings",
                },
                {
                  name: "DB Bench",
                  scheme: "3 x 12",
                  weight: "30",
                  notes: "Each dumbbell",
                },
              ],
            },
            {
              // Day 3 - Deadlift Focus
              exercises: [
                {
                  name: "Competition Deadlift",
                  scheme: "5 x 3 @ RPE 7",
                  weight: "180",
                  notes: "Dead stop each rep",
                },
                {
                  name: "Paused Deadlift",
                  scheme: "3 x 3 @ RPE 6",
                  weight: "160",
                  notes: "2 inch off floor pause",
                },
                {
                  name: "Good Morning",
                  scheme: "3 x 10",
                  weight: "60",
                  notes: "Hinge pattern focus",
                },
              ],
            },
            {
              // Day 4 - Variation Day
              exercises: [
                {
                  name: "SSB Squat",
                  scheme: "4 x 8",
                  weight: "120",
                  notes: "Control descent",
                },
                {
                  name: "Incline Bench",
                  scheme: "4 x 10",
                  weight: "75",
                  notes: "30 degree angle",
                },
                {
                  name: "Block Pull",
                  scheme: "3 x 5",
                  weight: "170",
                  notes: "3 inch blocks",
                },
              ],
            },
          ],
        },
        {
          exercises: [
            {
              // Day 1 - Squat Focus
              exercises: [
                {
                  name: "Competition Squat",
                  scheme: "5 x 5 @ RPE 7.5",
                  weight: "145",
                  notes: "1 count pause",
                },
                {
                  name: "Tempo Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "125",
                  notes: "3-1-0 tempo",
                },
              ],
            },
            {
              // Day 2 - Bench Focus
              exercises: [
                {
                  name: "Competition Bench",
                  scheme: "5 x 5 @ RPE 7.5",
                  weight: "105",
                  notes: "1 count pause",
                },
                {
                  name: "Close Grip Bench",
                  scheme: "4 x 8 @ RPE 7",
                  weight: "85",
                  notes: "Index finger on rings",
                },
                {
                  name: "DB Bench",
                  scheme: "3 x 12",
                  weight: "30",
                  notes: "Each dumbbell",
                },
              ],
            },
            {
              // Day 3 - Deadlift Focus
              exercises: [
                {
                  name: "Competition Deadlift",
                  scheme: "5 x 3 @ RPE 7",
                  weight: "180",
                  notes: "Dead stop each rep",
                },
                {
                  name: "Paused Deadlift",
                  scheme: "3 x 3 @ RPE 6",
                  weight: "160",
                  notes: "2 inch off floor pause",
                },
                {
                  name: "Good Morning",
                  scheme: "3 x 10",
                  weight: "60",
                  notes: "Hinge pattern focus",
                },
              ],
            },
            {
              // Day 4 - Variation Day
              exercises: [
                {
                  name: "SSB Squat",
                  scheme: "4 x 8",
                  weight: "120",
                  notes: "Control descent",
                },
                {
                  name: "Incline Bench",
                  scheme: "4 x 10",
                  weight: "75",
                  notes: "30 degree angle",
                },
                {
                  name: "Block Pull",
                  scheme: "3 x 5",
                  weight: "170",
                  notes: "3 inch blocks",
                },
              ],
            },
          ],
        },
        {
          exercises: [
            {
              // Day 1 - Squat Focus
              exercises: [
                {
                  name: "Competition Squat",
                  scheme: "4 x 5 @ RPE 8",
                  weight: "150",
                  notes: "Competition commands",
                },
                {
                  name: "Tempo Squat",
                  scheme: "3 x 5 @ RPE 7.5",
                  weight: "130",
                  notes: "3-1-0 tempo",
                },
              ],
            },
            {
              // Day 2 - Bench Focus
              exercises: [
                {
                  name: "Competition Bench",
                  scheme: "4 x 5 @ RPE 8",
                  weight: "105",
                  notes: "Competition commands",
                },
                {
                  name: "Close Grip Bench",
                  scheme: "4 x 8 @ RPE 7",
                  weight: "85",
                  notes: "Index finger on rings",
                },
                {
                  name: "DB Bench",
                  scheme: "3 x 12",
                  weight: "30",
                  notes: "Each dumbbell",
                },
              ],
            },
            {
              // Day 3 - Deadlift Focus
              exercises: [
                {
                  name: "Competition Deadlift",
                  scheme: "5 x 3 @ RPE 7",
                  weight: "180",
                  notes: "Dead stop each rep",
                },
                {
                  name: "Paused Deadlift",
                  scheme: "3 x 3 @ RPE 6",
                  weight: "160",
                  notes: "2 inch deficit",
                },
                {
                  name: "Good Morning",
                  scheme: "3 x 10",
                  weight: "60",
                  notes: "Hinge pattern focus",
                },
              ],
            },
            {
              // Day 4 - Variation Day
              exercises: [
                {
                  name: "SSB Squat",
                  scheme: "4 x 8",
                  weight: "120",
                  notes: "Control descent",
                },
                {
                  name: "Incline Bench",
                  scheme: "4 x 10",
                  weight: "75",
                  notes: "30 degree angle",
                },
                {
                  name: "Block Pull",
                  scheme: "3 x 5",
                  weight: "170",
                  notes: "3 inch blocks",
                },
              ],
            },
          ],
        },
        {
          exercises: [
            {
              // Day 1 - Squat Focus
              exercises: [
                {
                  name: "Competition Squat",
                  scheme: "3 x 5 @ RPE 6.5",
                  weight: "135",
                  notes: "Speed focus",
                },
                {
                  name: "Tempo Squat",
                  scheme: "2 x 5 @ RPE 6",
                  weight: "115",
                  notes: "3-1-0 tempo",
                },
              ],
            },
            {
              // Day 2 - Bench Focus
              exercises: [
                {
                  name: "Competition Bench",
                  scheme: "3 x 5 @ RPE 6.5",
                  weight: "105",
                  notes: "Technique focus",
                },
                {
                  name: "Close Grip Bench",
                  scheme: "4 x 8 @ RPE 7",
                  weight: "85",
                  notes: "Index finger on rings",
                },
                {
                  name: "DB Bench",
                  scheme: "3 x 12",
                  weight: "30",
                  notes: "Each dumbbell",
                },
              ],
            },
            {
              // Day 3 - Deadlift Focus
              exercises: [
                {
                  name: "Competition Deadlift",
                  scheme: "5 x 3 @ RPE 7",
                  weight: "180",
                  notes: "Dead stop each rep",
                },
                {
                  name: "Paused Deadlift",
                  scheme: "3 x 3 @ RPE 6",
                  weight: "160",
                  notes: "2 inch deficit",
                },
                {
                  name: "Good Morning",
                  scheme: "3 x 10",
                  weight: "60",
                  notes: "Hinge pattern focus",
                },
              ],
            },
            {
              // Day 4 - Variation Day
              exercises: [
                {
                  name: "SSB Squat",
                  scheme: "4 x 8",
                  weight: "120",
                  notes: "Control descent",
                },
                {
                  name: "Incline Bench",
                  scheme: "4 x 10",
                  weight: "75",
                  notes: "30 degree angle",
                },
                {
                  name: "Block Pull",
                  scheme: "3 x 5",
                  weight: "170",
                  notes: "3 inch blocks",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Intensity Block",
      startDate: "Jan 1, 2024",
      endDate: "Jan 28, 2024",
      status: "completed",
      sessionsPerWeek: 3,
      weeks: [
        {
          exercises: [
            {
              // Day 1 - SBD Heavy
              exercises: [
                {
                  name: "Competition Squat",
                  scheme: "3 x 3 @ RPE 8",
                  weight: "160",
                  notes: "Competition commands",
                },
                {
                  name: "Competition Bench",
                  scheme: "3 x 3 @ RPE 8",
                  weight: "115",
                  notes: "Competition pause",
                },
                {
                  name: "Competition Deadlift",
                  scheme: "2 x 2 @ RPE 8",
                  weight: "200",
                  notes: "Competition setup",
                },
              ],
            },
            {
              // Day 2 - Technique Work
              exercises: [
                {
                  name: "Pin Squat",
                  scheme: "4 x 2 @ RPE 7",
                  weight: "150",
                  notes: "Below parallel",
                },
                {
                  name: "Spoto Press",
                  scheme: "4 x 3 @ RPE 7",
                  weight: "105",
                  notes: "1 inch off chest",
                },
                {
                  name: "Deficit Deadlift",
                  scheme: "3 x 3 @ RPE 7",
                  weight: "180",
                  notes: "2 inch deficit",
                },
              ],
            },
            {
              // Day 3 - Volume Work
              exercises: [
                {
                  name: "Front Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "120",
                  notes: "Maintain position",
                },
                {
                  name: "Larsen Press",
                  scheme: "3 x 6 @ RPE 7",
                  weight: "95",
                  notes: "Feet up",
                },
                {
                  name: "RDL",
                  scheme: "3 x 8 @ RPE 7",
                  weight: "150",
                  notes: "Slow eccentric",
                },
              ],
            },
          ],
        },
        {
          exercises: [
            {
              // Day 1 - SBD Heavy
              exercises: [
                {
                  name: "Competition Squat",
                  scheme: "3 x 3 @ RPE 8.5",
                  weight: "165",
                  notes: "Competition commands",
                },
                {
                  name: "Competition Bench",
                  scheme: "3 x 3 @ RPE 8.5",
                  weight: "117.5",
                  notes: "Competition pause",
                },
                {
                  name: "Competition Deadlift",
                  scheme: "2 x 2 @ RPE 8.5",
                  weight: "200",
                  notes: "Competition setup",
                },
              ],
            },
            {
              // Day 2 - Technique Work
              exercises: [
                {
                  name: "Pin Squat",
                  scheme: "4 x 2 @ RPE 7.5",
                  weight: "150",
                  notes: "Below parallel",
                },
                {
                  name: "Spoto Press",
                  scheme: "4 x 3 @ RPE 7.5",
                  weight: "105",
                  notes: "1 inch off chest",
                },
                {
                  name: "Deficit Deadlift",
                  scheme: "3 x 3 @ RPE 7.5",
                  weight: "180",
                  notes: "2 inch deficit",
                },
              ],
            },
            {
              // Day 3 - Volume Work
              exercises: [
                {
                  name: "Front Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "120",
                  notes: "Maintain position",
                },
                {
                  name: "Larsen Press",
                  scheme: "3 x 6 @ RPE 7",
                  weight: "95",
                  notes: "Feet up",
                },
                {
                  name: "RDL",
                  scheme: "3 x 8 @ RPE 7",
                  weight: "150",
                  notes: "Slow eccentric",
                },
              ],
            },
          ],
        },
        {
          exercises: [
            {
              // Day 1 - SBD Heavy
              exercises: [
                {
                  name: "Competition Squat",
                  scheme: "2 x 2 @ RPE 9",
                  weight: "170",
                  notes: "Competition commands",
                },
                {
                  name: "Competition Bench",
                  scheme: "2 x 2 @ RPE 9",
                  weight: "120",
                  notes: "Competition pause",
                },
                {
                  name: "Competition Deadlift",
                  scheme: "2 x 2 @ RPE 9",
                  weight: "200",
                  notes: "Competition setup",
                },
              ],
            },
            {
              // Day 2 - Technique Work
              exercises: [
                {
                  name: "Pin Squat",
                  scheme: "4 x 2 @ RPE 8",
                  weight: "150",
                  notes: "Below parallel",
                },
                {
                  name: "Spoto Press",
                  scheme: "4 x 3 @ RPE 8",
                  weight: "105",
                  notes: "1 inch off chest",
                },
                {
                  name: "Deficit Deadlift",
                  scheme: "3 x 3 @ RPE 8",
                  weight: "180",
                  notes: "2 inch deficit",
                },
              ],
            },
            {
              // Day 3 - Volume Work
              exercises: [
                {
                  name: "Front Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "120",
                  notes: "Maintain position",
                },
                {
                  name: "Larsen Press",
                  scheme: "3 x 6 @ RPE 7",
                  weight: "95",
                  notes: "Feet up",
                },
                {
                  name: "RDL",
                  scheme: "3 x 8 @ RPE 7",
                  weight: "150",
                  notes: "Slow eccentric",
                },
              ],
            },
          ],
        },
        {
          exercises: [
            {
              // Day 1 - SBD Heavy
              exercises: [
                {
                  name: "Competition Squat",
                  scheme: "2 x 2 @ RPE 7",
                  weight: "150",
                  notes: "Speed focus",
                },
                {
                  name: "Competition Bench",
                  scheme: "2 x 2 @ RPE 7",
                  weight: "105",
                  notes: "Technique focus",
                },
                {
                  name: "Competition Deadlift",
                  scheme: "2 x 2 @ RPE 7",
                  weight: "180",
                  notes: "Speed focus",
                },
              ],
            },
            {
              // Day 2 - Technique Work
              exercises: [
                {
                  name: "Pin Squat",
                  scheme: "4 x 2 @ RPE 7",
                  weight: "150",
                  notes: "Below parallel",
                },
                {
                  name: "Spoto Press",
                  scheme: "4 x 3 @ RPE 7",
                  weight: "105",
                  notes: "1 inch off chest",
                },
                {
                  name: "Deficit Deadlift",
                  scheme: "3 x 3 @ RPE 7",
                  weight: "180",
                  notes: "2 inch deficit",
                },
              ],
            },
            {
              // Day 3 - Volume Work
              exercises: [
                {
                  name: "Front Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "120",
                  notes: "Maintain position",
                },
                {
                  name: "Larsen Press",
                  scheme: "3 x 6 @ RPE 7",
                  weight: "95",
                  notes: "Feet up",
                },
                {
                  name: "RDL",
                  scheme: "3 x 8 @ RPE 7",
                  weight: "150",
                  notes: "Slow eccentric",
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  const [isBlockRenameModalVisible, setIsBlockRenameModalVisible] =
    useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [tempBlockName, setTempBlockName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      const loadBlocks = async () => {
        try {
          console.log("Loading blocks for athlete:", route.params.client.id);
          const athleteRef = doc(db, "users", route.params.client.id);
          const athleteDoc = await getDoc(athleteRef);
          const athleteData = athleteDoc.data();

          console.log("Athlete data:", athleteData);

          if (athleteData) {
            const blocks = athleteData.activeBlocks || [];
            blocks.sort((a, b) => {
              const dateA = new Date(a.createdAt || 0);
              const dateB = new Date(b.createdAt || 0);
              return dateB - dateA;
            });
            console.log("Setting active blocks:", blocks);
            setActiveBlocks(blocks);
          }
        } catch (error) {
          console.error("Error loading blocks:", error);
          Alert.alert("Error", "Failed to load training blocks");
        }
      };

      loadBlocks();
    }, [route.params.client.id])
  );

  const handleNewBlock = async (blockName, sessionsPerWeek) => {
    try {
      console.log("Creating new block:", blockName);
      // Move current block to previous blocks if it exists
      if (activeBlocks.length > 0) {
        setPreviousBlocks([...activeBlocks, ...previousBlocks]);
      }

      // Create new block
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 28); // 4 weeks from today

      const newBlock = {
        id: Date.now().toString(),
        name: blockName,
        startDate: today.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        endDate: endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: "active",
        sessionsPerWeek,
        weeks: [
          {
            exercises: Array(sessionsPerWeek).fill({
              exercises: [],
            }),
          },
        ],
        coachId: auth.currentUser.uid,
        athleteId: route.params.client.id,
        createdAt: new Date().toISOString(),
      };

      // Add console log before updating Firebase
      console.log("New block to be added:", newBlock);

      // Update both coach and athlete documents
      const batch = writeBatch(db);

      // Update athlete's active blocks
      const athleteRef = doc(db, "users", route.params.client.id);
      batch.update(athleteRef, {
        activeBlocks: arrayUnion(newBlock),
      });

      // Store block in blocks collection
      const blockRef = doc(db, "blocks", newBlock.id);
      batch.set(blockRef, newBlock);

      await batch.commit();

      console.log("Block added successfully");
      // Update local state with the new block
      setActiveBlocks(currentBlocks => {
        const updatedBlocks = [...currentBlocks, newBlock].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        console.log("Updated active blocks:", updatedBlocks);
        return updatedBlocks;
      });
    } catch (error) {
      console.error("Error creating block:", error);
      Alert.alert("Error", "Failed to create block");
    }
  };

  const handleCloseBlock = (blockToClose) => {
    // Move block to previous blocks
    setPreviousBlocks([
      {
        ...blockToClose,
        status: "completed",
      },
      ...previousBlocks,
    ]);

    // Remove from active blocks
    setActiveBlocks(
      activeBlocks.filter((block) => block.id !== blockToClose.id)
    );
  };

  const handleReopenBlock = (blockToReopen) => {
    // Remove from previous blocks
    setPreviousBlocks(
      previousBlocks.filter((block) => block.id !== blockToReopen.id)
    );

    // Add to active blocks
    setActiveBlocks([
      ...activeBlocks,
      {
        ...blockToReopen,
        status: "active",
      },
    ]);
  };

  const handleDuplicateBlock = (blockToDuplicate) => {
    const duplicatedBlock = {
      ...JSON.parse(JSON.stringify(blockToDuplicate)),
      id: Date.now(), // Generate a new unique ID
      name: `${blockToDuplicate.name} (Copy)`,
      startDate: "", // Clear dates as they'll need to be set
      endDate: "",
      status: "active",
    };

    setActiveBlocks([...activeBlocks, duplicatedBlock]);
  };

  const handleRenameBlock = (block) => {
    setSelectedBlock(block);
    setTempBlockName(block.name);
    setIsBlockRenameModalVisible(true);
  };

  const saveBlockName = () => {
    if (selectedBlock && tempBlockName.trim()) {
      if (selectedBlock.status === "active") {
        setActiveBlocks(
          activeBlocks.map((block) =>
            block.id === selectedBlock.id
              ? { ...block, name: tempBlockName.trim() }
              : block
          )
        );
      } else {
        setPreviousBlocks(
          previousBlocks.map((block) =>
            block.id === selectedBlock.id
              ? { ...block, name: tempBlockName.trim() }
              : block
          )
        );
      }
    }
    setIsBlockRenameModalVisible(false);
  };

  const filterBlocks = (blocks) => {
    return blocks
      .sort((a, b) => {
        // Sort by createdAt in descending order (newest first)
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      })
      .filter((block) =>
        (block.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const handleDeleteBlock = async (blockId, isActive) => {
    try {
      // Create batch write
      const batch = writeBatch(db);

      // Get references
      const athleteRef = doc(db, "users", route.params.client.id);
      const blockRef = doc(db, "blocks", blockId);

      // Get current block to remove
      const blockToRemove = activeBlocks.find(block => block.id === blockId);
      
      if (isActive) {
        // Remove from athlete's active blocks
        batch.update(athleteRef, {
          activeBlocks: arrayRemove(blockToRemove)
        });

        // Delete from blocks collection
        batch.delete(blockRef);

        // Update local state
        setActiveBlocks(activeBlocks.filter((block) => block.id !== blockId));
      } else {
        // Handle previous blocks if needed
        setPreviousBlocks(previousBlocks.filter((block) => block.id !== blockId));
      }

      // Commit the batch
      await batch.commit();
      console.log("Block deleted successfully");

    } catch (error) {
      console.error("Error deleting block:", error);
      Alert.alert("Error", "Failed to delete block");
    }
  };

  const handleUpdateBlock = (updatedBlock) => {
    setActiveBlocks(currentBlocks => 
      currentBlocks.map(block => 
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  };

  const renderBlock = (block, isPrevious = false) => (
    <TouchableOpacity
      key={block.id}
      style={[styles.blockCard, isPrevious && styles.previousBlock]}
      onPress={() =>
        navigation.navigate("WorkoutProgram", {
          block,
          onCloseBlock: () => {},
          isPreviousBlock: isPrevious,
          onReopenBlock: () => {},
          isAthlete: false,
          onUpdateBlock: handleUpdateBlock
        })
      }
    >
      <View style={styles.blockHeader}>
        <View style={styles.blockTitleContainer}>
          <Text style={styles.blockName}>{block.name}</Text>
          <TouchableOpacity
            style={styles.blockRenameButton}
            onPress={(e) => {
              e.stopPropagation();
              handleRenameBlock(block);
            }}
          >
            <Icon name="pencil-outline" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.blockActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteBlock(block.id, true);
            }}
          >
            <Icon name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.duplicateButton}
            onPress={() => handleDuplicateBlock(block)}
          >
            <Icon name="copy-outline" size={18} color="#4CAF50" />
          </TouchableOpacity>
          <View style={styles.statusBadge}>
            <Icon name="radio-button-on" size={18} color="#4CAF50" />
          </View>
        </View>
      </View>
      <Text style={styles.dateText}>
        {block.startDate} - {block.endDate}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollView}>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <View style={[styles.profilePhoto, { backgroundColor: "#A8E6CF" }]}>
              <Text style={styles.initial}>
                {client.firstName[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.clientName}>
                {client.firstName} {client.lastName}
              </Text>
              <Text style={styles.username}>@{client.username}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.newBlockButton}
            onPress={() => {
              navigation.navigate("CreateBlock", {
                client,
                onCreateBlock: handleNewBlock,
              });
            }}
          >
            <Text style={styles.newBlockText}>New Block</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Icon
              name="search-outline"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search blocks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View style={styles.blocksSection}>
          <Text style={styles.sectionTitle}>Active Blocks</Text>
          {activeBlocks.length > 0 ? (
            filterBlocks(activeBlocks).map((block) => renderBlock(block))
          ) : (
            <View style={styles.noBlockContainer}>
              <Text style={styles.noBlockText}>No active training blocks</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, styles.previousTitle]}>
            Previous Blocks
          </Text>
          {previousBlocks.length > 0 ? (
            filterBlocks(previousBlocks).map((block) => renderBlock(block, true))
          ) : (
            <View style={styles.noBlockContainer}>
              <Text style={styles.noBlockText}>
                No previous training blocks
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isBlockRenameModalVisible}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsBlockRenameModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Block</Text>
            <TextInput
              style={styles.modalInput}
              value={tempBlockName}
              onChangeText={setTempBlockName}
              placeholder="Enter block name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsBlockRenameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveBlockName}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 40,
    paddingTop: 100, // Adjusted to account for back button
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 40,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  clientHeader: {
    marginBottom: 24,
    alignItems: "center",
    marginTop: 40,
  },
  clientInfo: {
    alignItems: "center",
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  initial: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
  },
  nameContainer: {
    alignItems: "center",
  },
  clientName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  newBlockButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  newBlockText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  blockTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  blockName: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
    flex: 1,
  },
  statusBadge: {
    padding: 4,
    opacity: 0.6,
  },
  dateText: {
    color: "#666",
    fontSize: 14,
  },
  noBlockContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
    marginVertical: 10,
  },
  noBlockText: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  blockActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 8,
  },
  duplicateButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: "transparent",
    opacity: 0.6,
  },
  blockRenameButton: {
    padding: 4,
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#000",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  actionButton: {
    padding: 4,
    marginRight: 8,
  },
  previousBlock: {
    backgroundColor: "#f0f0f0",
  },
});

export default ClientDetails;
