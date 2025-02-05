import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const WorkoutProgram = ({ route }) => {
  const navigation = useNavigation();
  const { block, onCloseBlock, isPreviousBlock, onReopenBlock } = route.params;
  const days = Array(block.sessionsPerWeek).fill(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(block.weeks?.length || 1);
  const [blockWeeks, setBlockWeeks] = useState(
    block.weeks || [
      {
        exercises: Array(block.sessionsPerWeek).fill({
          exercises: [],
        }),
      },
    ]
  );
  const weeks = Array(totalWeeks).fill(null);
  const scrollViewRef = useRef(null);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);

  const handleScroll = (event) => {
    if (isProgrammaticScroll) return; // Skip if programmatic scroll
    const xOffset = event.nativeEvent.contentOffset.x;
    const week = Math.round(xOffset / width) + 1;
    setCurrentWeek(week);
  };

  const handleAddWeek = () => {
    const newWeek = {
      exercises: Array(block.sessionsPerWeek).fill({
        exercises: [],
      }),
    };

    const newTotalWeeks = totalWeeks + 1;

    setBlockWeeks([...blockWeeks, newWeek]);
    setTotalWeeks(newTotalWeeks);
    setCurrentWeek(newTotalWeeks);

    setIsProgrammaticScroll(true); // Set flag before scrolling
    scrollViewRef.current?.scrollTo({
      x: (newTotalWeeks - 1) * width,
      animated: true,
    });

    // Reset flag after animation completes
    setTimeout(() => {
      setIsProgrammaticScroll(false);
    }, 500); // Adjust timing if needed
  };

  const handleCopyWeek = () => {
    // Create a deep copy of the current week
    const weekToCopy = JSON.parse(JSON.stringify(blockWeeks[currentWeek - 1]));
    const newTotalWeeks = totalWeeks + 1;

    setIsProgrammaticScroll(true);

    // Add the copied week to the end of blockWeeks and update states
    setBlockWeeks([...blockWeeks, weekToCopy]);
    setTotalWeeks(newTotalWeeks);

    // Use requestAnimationFrame to ensure state updates have processed
    requestAnimationFrame(() => {
      setCurrentWeek(newTotalWeeks);
      scrollViewRef.current?.scrollTo({
        x: (newTotalWeeks - 1) * width,
        animated: true,
      });

      // Reset scroll flag after animation
      setTimeout(() => {
        setIsProgrammaticScroll(false);
      }, 500);
    });
  };

  const handleDeleteWeek = () => {
    if (totalWeeks > 1) {
      // Remove the current week from blockWeeks
      const updatedWeeks = [...blockWeeks];
      updatedWeeks.splice(currentWeek - 1, 1);
      setBlockWeeks(updatedWeeks);

      setTotalWeeks(totalWeeks - 1);

      // If deleting last week, move to previous week
      if (currentWeek === totalWeeks) {
        setCurrentWeek(currentWeek - 1);
        scrollViewRef.current?.scrollTo({
          x: (currentWeek - 2) * width,
          animated: true,
        });
      } else {
        // Stay on same position but update week number since current week was deleted
        setCurrentWeek(currentWeek);
        scrollViewRef.current?.scrollTo({
          x: (currentWeek - 1) * width,
          animated: true,
        });
      }
    }
  };

  const handleReopenBlock = () => {
    // Call the callback to update the parent state
    onReopenBlock(block);
    // Navigate back to the client details screen
    navigation.goBack();
  };

  const handleCloseBlock = () => {
    // Call the callback to update the parent state
    onCloseBlock(block);
    // Navigate back to the client details screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{block.name}</Text>
        <View style={styles.weekHeader}>
          <Text style={styles.subtitle}>
            {block.startDate} - {block.endDate}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleAddWeek}
          >
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              New
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCopyWeek}
          >
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              Copy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteWeek}
            disabled={totalWeeks === 1}
          >
            <Text
              style={[
                styles.actionButtonText,
                styles.deleteButtonText,
                totalWeeks === 1 && styles.disabledButtonText,
              ]}
            >
              Delete
            </Text>
          </TouchableOpacity>

          {isPreviousBlock ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleReopenBlock}
            >
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Reopen
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.closeButton]}
              onPress={handleCloseBlock}
            >
              <Text style={[styles.actionButtonText, styles.closeButtonText]}>
                Close
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {weeks.map((_, weekIndex) => (
          <ScrollView
            key={weekIndex}
            style={[styles.programContainer, { width }]}
          >
            {blockWeeks
              ? // For existing blocks with data
                blockWeeks[weekIndex].exercises.map((day, dayIndex) => (
                  <View key={dayIndex} style={styles.daySection}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayTitle}>Day {dayIndex + 1}</Text>
                      <TouchableOpacity
                        style={styles.addExerciseButton}
                        onPress={() => {
                          // Handle adding new exercise
                        }}
                      >
                        <Text style={styles.addExerciseIcon}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.exercisesContainer}>
                      {day.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exercise}>
                          <TextInput
                            style={styles.exerciseNameInput}
                            defaultValue={exercise.name}
                            placeholder="Exercise name"
                          />
                          <View style={styles.exerciseDetails}>
                            <View style={styles.setScheme}>
                              <TextInput
                                style={styles.schemeInput}
                                defaultValue={exercise.scheme}
                                placeholder="Sets x Reps @ RPE"
                              />
                            </View>
                            <View style={styles.weightInput}>
                              <Text style={styles.weightLabel}>Weight:</Text>
                              <TextInput
                                style={styles.weightTextInput}
                                defaultValue={exercise.weight}
                                keyboardType="numeric"
                                placeholder="0"
                              />
                              <Text style={styles.weightUnit}>kg</Text>
                            </View>
                          </View>
                          <View style={styles.noteContainer}>
                            <Text style={styles.noteLabel}>Notes:</Text>
                            <TextInput
                              style={styles.noteInput}
                              defaultValue={exercise.notes}
                              placeholder="Add notes here"
                              multiline
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                ))
              : // For new blocks without data
                Array(block.sessionsPerWeek)
                  .fill(null)
                  .map((_, dayIndex) => (
                    <View key={dayIndex} style={styles.daySection}>
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayTitle}>Day {dayIndex + 1}</Text>
                        <TouchableOpacity
                          style={styles.addExerciseButton}
                          onPress={() => {
                            // Handle adding new exercise
                          }}
                        >
                          <Text style={styles.addExerciseIcon}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.exercisesContainer}>
                        <View style={styles.exercise}>
                          <TextInput
                            style={styles.exerciseNameInput}
                            placeholder="Exercise name"
                          />
                          <View style={styles.exerciseDetails}>
                            <View style={styles.setScheme}>
                              <TextInput
                                style={styles.schemeInput}
                                placeholder="Sets x Reps @ RPE"
                              />
                            </View>
                            <View style={styles.weightInput}>
                              <Text style={styles.weightLabel}>Weight:</Text>
                              <TextInput
                                style={styles.weightTextInput}
                                defaultValue="0"
                                keyboardType="numeric"
                                placeholder="0"
                              />
                              <Text style={styles.weightUnit}>kg</Text>
                            </View>
                          </View>
                          <View style={styles.noteContainer}>
                            <Text style={styles.noteLabel}>Notes:</Text>
                            <TextInput
                              style={styles.noteInput}
                              placeholder="Add notes here"
                              multiline
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
          </ScrollView>
        ))}
      </ScrollView>

      <View style={styles.weekNavigation}>
        <View style={styles.dotsContainer}>
          {Array(totalWeeks)
            .fill(null)
            .map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentWeek === index + 1 && styles.dotActive,
                ]}
              />
            ))}
        </View>
        <Text style={styles.weekLabel}>Week {currentWeek}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 120,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    marginTop: -60,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  weekHeader: {
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
  },
  programContainer: {
    flex: 1,
    width: width,
    paddingHorizontal: 24,
  },
  daySection: {
    marginBottom: 32,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  addExerciseButton: {
    padding: 4,
  },
  addExerciseIcon: {
    fontSize: 24,
    color: "#000",
    fontWeight: "300",
  },
  exercisesContainer: {
    borderRadius: 16,
  },
  exercise: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  exerciseNameInput: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
    padding: 0,
  },
  exerciseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  setScheme: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  schemeInput: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
    padding: 0,
    flex: 1,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 110,
  },
  weightLabel: {
    fontSize: 15,
    color: "#666",
    marginRight: 6,
  },
  weightTextInput: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
    padding: 0,
    minWidth: 40,
    textAlign: "right",
  },
  weightUnit: {
    fontSize: 15,
    color: "#000",
    marginLeft: 4,
  },
  noteContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  noteLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  noteInput: {
    fontSize: 14,
    color: "#000",
    lineHeight: 20,
    padding: 0,
  },
  weekNavigation: {
    alignItems: "center",
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e0e0e0",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#000",
  },
  weekLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 6,
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    borderColor: "#000",
    backgroundColor: "#fff",
  },
  primaryButtonText: {
    color: "#000",
  },
  deleteButton: {
    borderColor: "#FF3B30",
    backgroundColor: "#fff",
  },
  deleteButtonText: {
    color: "#FF3B30",
  },
  closeButton: {
    borderColor: "#000",
    backgroundColor: "#000",
  },
  closeButtonText: {
    color: "#fff",
  },
  disabledButtonText: {
    opacity: 0.5,
  },
});

export default WorkoutProgram;
