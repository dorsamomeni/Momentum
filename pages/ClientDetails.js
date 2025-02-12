import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const ClientDetails = ({ route }) => {
  const navigation = useNavigation();
  const { client } = route.params;

  // Change currentBlock to activeBlocks array
  const [activeBlocks, setActiveBlocks] = useState([
    {
      id: 1,
      name: "Strength Block",
      startDate: "Mar 1, 2024",
      endDate: "Mar 28, 2024",
      status: "active",
      sessionsPerWeek: 3,
    },
  ]);

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  const handleNewBlock = (blockName, sessionsPerWeek) => {
    // Move current block to previous blocks if it exists
    if (activeBlocks.length > 0) {
      setPreviousBlocks([...activeBlocks, ...previousBlocks]);
    }

    // Create new block
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 28); // 4 weeks from today

    const newBlock = {
      id: Date.now(),
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
          // Start with just one week
          exercises: Array(sessionsPerWeek).fill({
            exercises: [], // Empty array for each day's exercises
          }),
        },
      ],
    };

    setActiveBlocks([newBlock]);
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

  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [month, day, year] = dateString.split("/");
    return new Date(year, month - 1, day);
  };

  const isDateInRange = (blockStartDate, blockEndDate) => {
    if (!dateFilter.startDate && !dateFilter.endDate) return true;

    const blockStart = new Date(blockStartDate);
    const blockEnd = new Date(blockEndDate);
    const filterStart = dateFilter.startDate
      ? parseDate(dateFilter.startDate)
      : null;
    const filterEnd = dateFilter.endDate ? parseDate(dateFilter.endDate) : null;

    if (filterStart && filterEnd) {
      return blockStart >= filterStart && blockEnd <= filterEnd;
    } else if (filterStart) {
      return blockStart >= filterStart;
    } else if (filterEnd) {
      return blockEnd <= filterEnd;
    }
    return true;
  };

  const filterBlocks = (blocks) => {
    const query = searchQuery.toLowerCase();
    return blocks.filter((block) => {
      const matchesSearch = block.name.toLowerCase().includes(query);
      const matchesDate = isDateInRange(block.startDate, block.endDate);
      return matchesSearch && matchesDate;
    });
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

          <TouchableOpacity
            style={[
              styles.filterButton,
              (dateFilter.startDate || dateFilter.endDate) &&
                styles.filterButtonActive,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon
              name="calendar-outline"
              size={20}
              color={
                dateFilter.startDate || dateFilter.endDate ? "#000" : "#666"
              }
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Filter by Date</Text>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setDateFilter({
                    startDate: "",
                    endDate: "",
                  });
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateRangeContainer}>
              <View style={styles.dateInputWrapper}>
                <Text style={styles.dateRangeLabel}>Start Date</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="MM/DD/YYYY"
                  value={dateFilter.startDate}
                  onChangeText={(text) => {
                    setDateFilter((prev) => ({
                      ...prev,
                      startDate: text,
                    }));
                  }}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.dateInputWrapper}>
                <Text style={styles.dateRangeLabel}>End Date</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="MM/DD/YYYY"
                  value={dateFilter.endDate}
                  onChangeText={(text) => {
                    setDateFilter((prev) => ({
                      ...prev,
                      endDate: text,
                    }));
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}

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
    padding: 40,
    paddingTop: 140,
    paddingBottom: 60,
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
    padding: 4, // Match other button padding
    opacity: 0.6, // Match other button opacity
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  filterButtonActive: {
    backgroundColor: "#fff",
    borderColor: "#000",
  },
  datePickerContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  dateRangeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  dateInputWrapper: {
    flex: 1,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    color: "#000",
    backgroundColor: "#fff",
  },
  dateRangeLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  actionButton: {
    padding: 4,
    marginRight: 8,
  },
});

export default ClientDetails;
