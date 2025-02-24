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
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { auth, db } from "../src/config/firebase";
import {
  writeBatch,
  doc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

const ClientDetails = ({ route }) => {
  const navigation = useNavigation();
  const { client } = route.params;

  // Change currentBlock to activeBlocks array
  const [activeBlocks, setActiveBlocks] = useState([
    // {
    //   id: 1,
    //   name: "Strength Block",
    //   startDate: "Mar 1, 2024",
    //   endDate: "Mar 28, 2024",
    //   status: "active",
    //   sessionsPerWeek: 3,
    // },
  ]);

  const [previousBlocks, setPreviousBlocks] = useState([
    // {
    //   id: 2,
    //   name: "Volume Block",
    //   startDate: "Feb 1, 2024",
    //   endDate: "Feb 28, 2024",
    //   status: "completed",
    //   sessionsPerWeek: 4,
    //   weeks: [
  ]);

  const [isBlockRenameModalVisible, setIsBlockRenameModalVisible] =
    useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [tempBlockName, setTempBlockName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        // Make sure we're fetching as a coach
        const user = auth.currentUser;
        console.log("Current user:", user?.uid);
        if (!user) return;

        // First verify the coach has access to this athlete
        const coachDoc = await getDoc(doc(db, "users", user.uid));
        const coachData = coachDoc.data();
        console.log("Coach data:", {
          role: coachData.role,
          athletes: coachData.athletes,
          clientId: route.params.client.id,
        });

        if (!coachData.athletes?.includes(route.params.client.id)) {
          throw new Error("Not authorized to view this client's blocks");
        }

        // Then fetch the blocks
        const activeBlocksQuery = query(
          collection(db, "blocks"),
          where("athleteId", "==", route.params.client.id),
          where("coachId", "==", user.uid),
          where("status", "in", ["active", "submitted"])
        );

        console.log("Fetching blocks for athlete:", route.params.client.id);
        const querySnapshot = await getDocs(activeBlocksQuery);
        console.log("Blocks found:", querySnapshot.docs.length);

        const blocks = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("Block data:", {
            id: doc.id,
            athleteId: data.athleteId,
            coachId: data.coachId,
            status: data.status,
          });
          return {
            id: doc.id,
            ...data,
          };
        });
        setActiveBlocks(blocks);

        // Fetch previous (completed) blocks
        const previousBlocksQuery = query(
          collection(db, "blocks"),
          where("athleteId", "==", route.params.client.id),
          where("status", "==", "completed")
        );

        const previousSnapshot = await getDocs(previousBlocksQuery);
        const previousBlocks = previousSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPreviousBlocks(previousBlocks);
      } catch (error) {
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          stack: error.stack,
        });
        Alert.alert("Error", "Failed to fetch blocks");
      }
    };

    fetchBlocks();
  }, [route.params.client.id]);

  const handleNewBlock = async (blockName, sessionsPerWeek) => {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 28);

      const blockId = `block_${Date.now()}`;
      const newBlock = {
        id: blockId,
        name: blockName,
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
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

      const batch = writeBatch(db);

      // Store block reference in athlete's document
      const athleteRef = doc(db, "users", route.params.client.id);
      batch.update(athleteRef, {
        activeBlocks: arrayUnion(blockId),
      });

      // Store block in blocks collection
      const blockRef = doc(db, "blocks", blockId);
      batch.set(blockRef, newBlock);

      await batch.commit();
      // Update the active blocks by adding to existing ones
      setActiveBlocks((prevBlocks) => [...prevBlocks, newBlock]);
    } catch (error) {
      console.error("Error creating block:", error);
      Alert.alert("Error", "Failed to create block");
    }
  };

  const handleCloseBlock = async (blockToClose) => {
    try {
      const batch = writeBatch(db);

      // Update block status in Firestore
      const blockRef = doc(db, "blocks", blockToClose.id);
      batch.update(blockRef, {
        status: "completed",
        updatedAt: new Date().toISOString(),
      });

      // Update athlete's activeBlocks array
      const athleteRef = doc(db, "users", route.params.client.id);
      batch.update(athleteRef, {
        activeBlocks: arrayRemove(blockToClose.id),
      });

      await batch.commit();

      // Update local state
      setPreviousBlocks((prev) => [
        {
          ...blockToClose,
          status: "completed",
        },
        ...prev,
      ]);

      setActiveBlocks((prev) =>
        prev.filter((block) => block.id !== blockToClose.id)
      );
    } catch (error) {
      console.error("Error closing block:", error);
      Alert.alert("Error", "Failed to close block");
    }
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
    return blocks.filter((block) =>
      block.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleDeleteBlock = (blockId, isActive) => {
    if (isActive) {
      setActiveBlocks(activeBlocks.filter((block) => block.id !== blockId));
    } else {
      setPreviousBlocks(previousBlocks.filter((block) => block.id !== blockId));
    }
  };

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
            filterBlocks(activeBlocks).map((block) => (
              <TouchableOpacity
                key={block.id}
                style={styles.blockCard}
                onPress={() =>
                  navigation.navigate("WorkoutProgram", {
                    block,
                    onCloseBlock: handleCloseBlock,
                    isPreviousBlock: false,
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
            ))
          ) : (
            <View style={styles.noBlockContainer}>
              <Text style={styles.noBlockText}>No active training blocks</Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, styles.previousTitle]}>
            Previous Blocks
          </Text>
          {previousBlocks.length > 0 ? (
            filterBlocks(previousBlocks).map((block) => (
              <TouchableOpacity
                key={block.id}
                style={styles.blockCard}
                onPress={() =>
                  navigation.navigate("WorkoutProgram", {
                    block,
                    onReopenBlock: handleReopenBlock,
                    isPreviousBlock: true,
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
                        handleDeleteBlock(block.id, false);
                      }}
                    >
                      <Icon name="trash-outline" size={18} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.duplicateButton}
                      onPress={() => handleDuplicateBlock(block)}
                    >
                      <Icon name="copy-outline" size={18} color="#666" />
                    </TouchableOpacity>
                    <View style={styles.statusBadge}>
                      <Icon name="checkmark-circle" size={18} color="#666" />
                    </View>
                  </View>
                </View>
                <Text style={styles.dateText}>
                  {block.startDate} - {block.endDate}
                </Text>
              </TouchableOpacity>
            ))
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
});

export default ClientDetails;
