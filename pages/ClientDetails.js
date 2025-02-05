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
                  notes: "2 count pause at bottom"
                },
                {
                  name: "Tempo Squat",
                  scheme: "3 x 5 @ RPE 6",
                  weight: "120",
                  notes: "3-1-0 tempo"
                },
                {
                  name: "Belt Squat",
                  scheme: "3 x 12",
                  weight: "80",
                  notes: "Focus on quad drive"
                }
              ]
            },
            {
              // Day 2 - Bench Focus
              exercises: [
                {
                  name: "Competition Bench",
                  scheme: "5 x 5 @ RPE 7",
                  weight: "100",
                  notes: "1 count pause"
                },
                {
                  name: "Close Grip Bench",
                  scheme: "4 x 8 @ RPE 7",
                  weight: "85",
                  notes: "Index finger on rings"
                },
                {
                  name: "DB Bench",
                  scheme: "3 x 12",
                  weight: "30",
                  notes: "Each dumbbell"
                }
              ]
            },
            {
              // Day 3 - Deadlift Focus
              exercises: [
                {
                  name: "Competition Deadlift",
                  scheme: "5 x 3 @ RPE 7",
                  weight: "180",
                  notes: "Dead stop each rep"
                },
                {
                  name: "Paused Deadlift",
                  scheme: "3 x 3 @ RPE 6",
                  weight: "160",
                  notes: "2 inch off floor pause"
                },
                {
                  name: "Good Morning",
                  scheme: "3 x 10",
                  weight: "60",
                  notes: "Hinge pattern focus"
                }
              ]
            },
            {
              // Day 4 - Variation Day
              exercises: [
                {
                  name: "SSB Squat",
                  scheme: "4 x 8",
                  weight: "120",
                  notes: "Control descent"
                },
                {
                  name: "Incline Bench",
                  scheme: "4 x 10",
                  weight: "75",
                  notes: "30 degree angle"
                },
                {
                  name: "Block Pull",
                  scheme: "3 x 5",
                  weight: "170",
                  notes: "3 inch blocks"
                }
              ]
            }
          ]
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
                  notes: "1 count pause"
                },
                {
                  name: "Tempo Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "125",
                  notes: "3-1-0 tempo"
                }
              ]
            },
            {
              // Day 2 - Bench Focus
              exercises: [
                {
                  name: "Competition Bench",
                  scheme: "5 x 5 @ RPE 7.5",
                  weight: "105",
                  notes: "1 count pause"
                },
                {
                  name: "Close Grip Bench",
                  scheme: "4 x 8 @ RPE 7",
                  weight: "85",
                  notes: "Index finger on rings"
                },
                {
                  name: "DB Bench",
                  scheme: "3 x 12",
                  weight: "30",
                  notes: "Each dumbbell"
                }
              ]
            },
            {
              // Day 3 - Deadlift Focus
              exercises: [
                {
                  name: "Competition Deadlift",
                  scheme: "5 x 3 @ RPE 7",
                  weight: "180",
                  notes: "Dead stop each rep"
                },
                {
                  name: "Paused Deadlift",
                  scheme: "3 x 3 @ RPE 6",
                  weight: "160",
                  notes: "2 inch off floor pause"
                },
                {
                  name: "Good Morning",
                  scheme: "3 x 10",
                  weight: "60",
                  notes: "Hinge pattern focus"
                }
              ]
            },
            {
              // Day 4 - Variation Day
              exercises: [
                {
                  name: "SSB Squat",
                  scheme: "4 x 8",
                  weight: "120",
                  notes: "Control descent"
                },
                {
                  name: "Incline Bench",
                  scheme: "4 x 10",
                  weight: "75",
                  notes: "30 degree angle"
                },
                {
                  name: "Block Pull",
                  scheme: "3 x 5",
                  weight: "170",
                  notes: "3 inch blocks"
                }
              ]
            }
          ]
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
                  notes: "Competition commands"
                },
                {
                  name: "Tempo Squat",
                  scheme: "3 x 5 @ RPE 7.5",
                  weight: "130",
                  notes: "3-1-0 tempo"
                }
              ]
            },
            {
              // Day 2 - Bench Focus
              exercises: [
                {
                  name: "Competition Bench",
                  scheme: "4 x 5 @ RPE 8",
                  weight: "105",
                  notes: "Competition commands"
                },
                {
                  name: "Close Grip Bench",
                  scheme: "4 x 8 @ RPE 7",
                  weight: "85",
                  notes: "Index finger on rings"
                },
                {
                  name: "DB Bench",
                  scheme: "3 x 12",
                  weight: "30",
                  notes: "Each dumbbell"
                }
              ]
            },
            {
              // Day 3 - Deadlift Focus
              exercises: [
                {
                  name: "Competition Deadlift",
                  scheme: "5 x 3 @ RPE 7",
                  weight: "180",
                  notes: "Dead stop each rep"
                },
                {
                  name: "Paused Deadlift",
                  scheme: "3 x 3 @ RPE 6",
                  weight: "160",
                  notes: "2 inch deficit"
                },
                {
                  name: "Good Morning",
                  scheme: "3 x 10",
                  weight: "60",
                  notes: "Hinge pattern focus"
                }
              ]
            },
            {
              // Day 4 - Variation Day
              exercises: [
                {
                  name: "SSB Squat",
                  scheme: "4 x 8",
                  weight: "120",
                  notes: "Control descent"
                },
                {
                  name: "Incline Bench",
                  scheme: "4 x 10",
                  weight: "75",
                  notes: "30 degree angle"
                },
                {
                  name: "Block Pull",
                  scheme: "3 x 5",
                  weight: "170",
                  notes: "3 inch blocks"
                }
              ]
            }
          ]
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
                  notes: "Speed focus"
                },
                {
                  name: "Tempo Squat",
                  scheme: "2 x 5 @ RPE 6",
                  weight: "115",
                  notes: "3-1-0 tempo"
                }
              ]
            },
            {
              // Day 2 - Bench Focus
              exercises: [
                {
                  name: "Competition Bench",
                  scheme: "3 x 5 @ RPE 6.5",
                  weight: "105",
                  notes: "Technique focus"
                },
                {
                  name: "Close Grip Bench",
                  scheme: "4 x 8 @ RPE 7",
                  weight: "85",
                  notes: "Index finger on rings"
                },
                {
                  name: "DB Bench",
                  scheme: "3 x 12",
                  weight: "30",
                  notes: "Each dumbbell"
                }
              ]
            },
            {
              // Day 3 - Deadlift Focus
              exercises: [
                {
                  name: "Competition Deadlift",
                  scheme: "5 x 3 @ RPE 7",
                  weight: "180",
                  notes: "Dead stop each rep"
                },
                {
                  name: "Paused Deadlift",
                  scheme: "3 x 3 @ RPE 6",
                  weight: "160",
                  notes: "2 inch deficit"
                },
                {
                  name: "Good Morning",
                  scheme: "3 x 10",
                  weight: "60",
                  notes: "Hinge pattern focus"
                }
              ]
            },
            {
              // Day 4 - Variation Day
              exercises: [
                {
                  name: "SSB Squat",
                  scheme: "4 x 8",
                  weight: "120",
                  notes: "Control descent"
                },
                {
                  name: "Incline Bench",
                  scheme: "4 x 10",
                  weight: "75",
                  notes: "30 degree angle"
                },
                {
                  name: "Block Pull",
                  scheme: "3 x 5",
                  weight: "170",
                  notes: "3 inch blocks"
                }
              ]
            }
          ]
        }
      ]
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
                  notes: "Competition commands"
                },
                {
                  name: "Competition Bench",
                  scheme: "3 x 3 @ RPE 8",
                  weight: "115",
                  notes: "Competition pause"
                },
                {
                  name: "Competition Deadlift",
                  scheme: "2 x 2 @ RPE 8",
                  weight: "200",
                  notes: "Competition setup"
                }
              ]
            },
            {
              // Day 2 - Technique Work
              exercises: [
                {
                  name: "Pin Squat",
                  scheme: "4 x 2 @ RPE 7",
                  weight: "150",
                  notes: "Below parallel"
                },
                {
                  name: "Spoto Press",
                  scheme: "4 x 3 @ RPE 7",
                  weight: "105",
                  notes: "1 inch off chest"
                },
                {
                  name: "Deficit Deadlift",
                  scheme: "3 x 3 @ RPE 7",
                  weight: "180",
                  notes: "2 inch deficit"
                }
              ]
            },
            {
              // Day 3 - Volume Work
              exercises: [
                {
                  name: "Front Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "120",
                  notes: "Maintain position"
                },
                {
                  name: "Larsen Press",
                  scheme: "3 x 6 @ RPE 7",
                  weight: "95",
                  notes: "Feet up"
                },
                {
                  name: "RDL",
                  scheme: "3 x 8 @ RPE 7",
                  weight: "150",
                  notes: "Slow eccentric"
                }
              ]
            }
          ]
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
                  notes: "Competition commands"
                },
                {
                  name: "Competition Bench",
                  scheme: "3 x 3 @ RPE 8.5",
                  weight: "117.5",
                  notes: "Competition pause"
                },
                {
                  name: "Competition Deadlift",
                  scheme: "2 x 2 @ RPE 8.5",
                  weight: "200",
                  notes: "Competition setup"
                }
              ]
            },
            {
              // Day 2 - Technique Work
              exercises: [
                {
                  name: "Pin Squat",
                  scheme: "4 x 2 @ RPE 7.5",
                  weight: "150",
                  notes: "Below parallel"
                },
                {
                  name: "Spoto Press",
                  scheme: "4 x 3 @ RPE 7.5",
                  weight: "105",
                  notes: "1 inch off chest"
                },
                {
                  name: "Deficit Deadlift",
                  scheme: "3 x 3 @ RPE 7.5",
                  weight: "180",
                  notes: "2 inch deficit"
                }
              ]
            },
            {
              // Day 3 - Volume Work
              exercises: [
                {
                  name: "Front Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "120",
                  notes: "Maintain position"
                },
                {
                  name: "Larsen Press",
                  scheme: "3 x 6 @ RPE 7",
                  weight: "95",
                  notes: "Feet up"
                },
                {
                  name: "RDL",
                  scheme: "3 x 8 @ RPE 7",
                  weight: "150",
                  notes: "Slow eccentric"
                }
              ]
            }
          ]
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
                  notes: "Competition commands"
                },
                {
                  name: "Competition Bench",
                  scheme: "2 x 2 @ RPE 9",
                  weight: "120",
                  notes: "Competition pause"
                },
                {
                  name: "Competition Deadlift",
                  scheme: "2 x 2 @ RPE 9",
                  weight: "200",
                  notes: "Competition setup"
                }
              ]
            },
            {
              // Day 2 - Technique Work
              exercises: [
                {
                  name: "Pin Squat",
                  scheme: "4 x 2 @ RPE 8",
                  weight: "150",
                  notes: "Below parallel"
                },
                {
                  name: "Spoto Press",
                  scheme: "4 x 3 @ RPE 8",
                  weight: "105",
                  notes: "1 inch off chest"
                },
                {
                  name: "Deficit Deadlift",
                  scheme: "3 x 3 @ RPE 8",
                  weight: "180",
                  notes: "2 inch deficit"
                }
              ]
            },
            {
              // Day 3 - Volume Work
              exercises: [
                {
                  name: "Front Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "120",
                  notes: "Maintain position"
                },
                {
                  name: "Larsen Press",
                  scheme: "3 x 6 @ RPE 7",
                  weight: "95",
                  notes: "Feet up"
                },
                {
                  name: "RDL",
                  scheme: "3 x 8 @ RPE 7",
                  weight: "150",
                  notes: "Slow eccentric"
                }
              ]
            }
          ]
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
                  notes: "Speed focus"
                },
                {
                  name: "Competition Bench",
                  scheme: "2 x 2 @ RPE 7",
                  weight: "105",
                  notes: "Technique focus"
                },
                {
                  name: "Competition Deadlift",
                  scheme: "2 x 2 @ RPE 7",
                  weight: "180",
                  notes: "Speed focus"
                }
              ]
            },
            {
              // Day 2 - Technique Work
              exercises: [
                {
                  name: "Pin Squat",
                  scheme: "4 x 2 @ RPE 7",
                  weight: "150",
                  notes: "Below parallel"
                },
                {
                  name: "Spoto Press",
                  scheme: "4 x 3 @ RPE 7",
                  weight: "105",
                  notes: "1 inch off chest"
                },
                {
                  name: "Deficit Deadlift",
                  scheme: "3 x 3 @ RPE 7",
                  weight: "180",
                  notes: "2 inch deficit"
                }
              ]
            },
            {
              // Day 3 - Volume Work
              exercises: [
                {
                  name: "Front Squat",
                  scheme: "3 x 5 @ RPE 7",
                  weight: "120",
                  notes: "Maintain position"
                },
                {
                  name: "Larsen Press",
                  scheme: "3 x 6 @ RPE 7",
                  weight: "95",
                  notes: "Feet up"
                },
                {
                  name: "RDL",
                  scheme: "3 x 8 @ RPE 7",
                  weight: "150",
                  notes: "Slow eccentric"
                }
              ]
            }
          ]
        }
      ]
    }
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
      id: Date.now(),
      name: blockName,
      startDate: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      endDate: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: "active",
      sessionsPerWeek,
      weeks: [{  // Start with just one week
        exercises: Array(sessionsPerWeek).fill({
          exercises: [] // Empty array for each day's exercises
        })
      }]
    };

    setCurrentBlock(newBlock);
  };

  const handleCloseBlock = (blockToClose) => {
    // Move current block to previous blocks
    setPreviousBlocks([
      {
        ...blockToClose,
        status: "completed"
      },
      ...previousBlocks,
    ]);
    
    // Clear current block
    setCurrentBlock(null);
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
          {currentBlock ? (
            <TouchableOpacity
              style={styles.blockCard}
              onPress={() => navigation.navigate("WorkoutProgram", {
                block: currentBlock,
                onCloseBlock: handleCloseBlock
              })}
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
          ) : (
            <View style={styles.noBlockContainer}>
              <Text style={styles.noBlockText}>No active training block</Text>
            </View>
          )}

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
  noBlockContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    marginVertical: 10,
  },
  noBlockText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ClientDetails; 