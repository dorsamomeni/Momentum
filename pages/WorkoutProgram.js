import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Animated,
  PanResponder,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSettings } from "../contexts/SettingsContext";

const { width } = Dimensions.get("window");

const WorkoutProgram = ({ route }) => {
  const navigation = useNavigation();
  const { block, onCloseBlock, isPreviousBlock, onReopenBlock } = route.params;
  const { weightUnit } = useSettings();
  const days = Array(block.sessionsPerWeek).fill(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(block.weeks?.length || 1);
  const [blockWeeks, setBlockWeeks] = useState(
    block.weeks || [
      {
        exercises: Array(block.sessionsPerWeek).fill({
          exercises: [
            {
              name: "",
              sets: [
                {
                  scheme: "",
                  weight: "",
                  setCount: "1",
                },
              ],
              notes: "",
            },
          ],
        }),
      },
    ]
  );
  const weeks = Array(totalWeeks).fill(null);
  const scrollViewRef = useRef(null);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const [weekNames, setWeekNames] = useState(
    Array(totalWeeks)
      .fill("")
      .map((_, i) => `Week ${i + 1}`)
  );
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(null);
  const [tempWeekName, setTempWeekName] = useState("");
  const weeksSliderRef = useRef(null);

  const handleScroll = (event) => {
    if (isProgrammaticScroll) return;
    const xOffset = event.nativeEvent.contentOffset.x;
    const week = Math.round(xOffset / width) + 1;
    setCurrentWeek(week);
  };

  const handleAddWeek = () => {
    const newWeek = {
      exercises: Array(block.sessionsPerWeek).fill({
        exercises: [
          {
            name: "",
            sets: [
              {
                scheme: "",
                weight: "",
                setCount: "1",
              },
            ],
            notes: "",
          },
        ],
      }),
    };

    const newTotalWeeks = totalWeeks + 1;
    const newWeekName = `Week ${newTotalWeeks}`;

    setIsProgrammaticScroll(true);

    // Update all states at once before animations
    setBlockWeeks([...blockWeeks, newWeek]);
    setTotalWeeks(newTotalWeeks);
    setWeekNames([...weekNames, newWeekName]);

    // Wait for state updates to process
    requestAnimationFrame(() => {
      // Set current week and trigger both scrolls simultaneously
      setCurrentWeek(newTotalWeeks);

      // Perform both scroll animations together
      scrollViewRef.current?.scrollTo({
        x: (newTotalWeeks - 1) * width,
        animated: true,
      });
      weeksSliderRef.current?.scrollToEnd({
        animated: true,
        duration: 300, // Match the default React Native scroll animation duration
      });

      // Reset programmatic scroll flag after animations complete
      setTimeout(() => {
        setIsProgrammaticScroll(false);
      }, 300);
    });
  };

  const handleCopyWeek = () => {
    const weekToCopy = JSON.parse(JSON.stringify(blockWeeks[currentWeek - 1]));
    const newTotalWeeks = totalWeeks + 1;
    const newWeekName = `Week ${newTotalWeeks}`;

    setIsProgrammaticScroll(true);

    // Update all states at once before animations
    setBlockWeeks([...blockWeeks, weekToCopy]);
    setTotalWeeks(newTotalWeeks);
    setWeekNames([...weekNames, newWeekName]);

    requestAnimationFrame(() => {
      setCurrentWeek(newTotalWeeks);

      // Perform both scroll animations together
      scrollViewRef.current?.scrollTo({
        x: (newTotalWeeks - 1) * width,
        animated: true,
      });
      weeksSliderRef.current?.scrollToEnd({
        animated: true,
        duration: 300,
      });

      setTimeout(() => {
        setIsProgrammaticScroll(false);
      }, 300);
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

  const handleAddExercise = (weekIndex, dayIndex) => {
    const newExercise = {
      name: "",
      sets: [
        {
          scheme: "",
          weight: "",
          setCount: "1", // Default to 1 set
        },
      ],
      notes: "",
    };

    const updatedWeeks = JSON.parse(JSON.stringify(blockWeeks));
    if (!updatedWeeks[weekIndex].exercises[dayIndex].exercises) {
      updatedWeeks[weekIndex].exercises[dayIndex].exercises = [];
    }
    updatedWeeks[weekIndex].exercises[dayIndex].exercises.push(newExercise);
    setBlockWeeks(updatedWeeks);
  };

  const handleAddSet = (weekIndex, dayIndex, exerciseIndex) => {
    const updatedWeeks = JSON.parse(JSON.stringify(blockWeeks));
    const exercise =
      updatedWeeks[weekIndex].exercises[dayIndex].exercises[exerciseIndex];

    if (!exercise.sets) {
      exercise.sets = [];
    }

    exercise.sets.push({
      scheme: "",
      weight: "",
    });

    setBlockWeeks(updatedWeeks);
  };

  const ExerciseItem = ({ exercise, index, weekIndex, dayIndex }) => {
    return (
      <View style={styles.exercise}>
        <View style={styles.exerciseContent}>
          <View style={styles.exerciseNameRow}>
            <TextInput
              style={styles.exerciseNameInput}
              defaultValue={exercise.name}
              placeholder="Exercise name"
            />
            <TouchableOpacity style={styles.dragHandle}>
              <Text style={styles.dragHandleText}>☰</Text>
            </TouchableOpacity>
          </View>

          {(exercise.sets || []).map((set, setIndex) => (
            <View key={setIndex} style={styles.setRow}>
              <View style={styles.setScheme}>
                <TextInput
                  style={styles.schemeInput}
                  defaultValue={set.scheme}
                  placeholder="Sets x Reps @ RPE"
                />
              </View>

              <View style={styles.weightInput}>
                <TextInput
                  style={styles.weightTextInput}
                  defaultValue={set.weight}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <TouchableOpacity
                  style={styles.weightUnitButton}
                  onPress={() =>
                    setWeightUnit(weightUnit === "kg" ? "lbs" : "kg")
                  }
                >
                  <Text style={styles.weightUnit}>{weightUnit}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addSetButton}
            onPress={() => handleAddSet(weekIndex, dayIndex, index)}
          >
            <Text style={styles.addSetButtonText}>+ Add Set</Text>
          </TouchableOpacity>

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
      </View>
    );
  };

  const handleRenameWeek = (index) => {
    setSelectedWeekIndex(index);
    setTempWeekName(weekNames[index]);
    setIsRenameModalVisible(true);
  };

  const saveWeekName = () => {
    if (selectedWeekIndex !== null && tempWeekName.trim()) {
      const newWeekNames = [...weekNames];
      newWeekNames[selectedWeekIndex] = tempWeekName.trim();
      setWeekNames(newWeekNames);
    }
    setIsRenameModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{block.name}</Text>
          </View>
        </View>
        <View style={styles.weekHeader}>
          <Text style={styles.subtitle}>
            {block.startDate} - {block.endDate}
          </Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleCopyWeek}
          >
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              Duplicate Week
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
                Reopen Block
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
                  <View
                    key={dayIndex}
                    style={[
                      styles.daySection,
                      dayIndex === 0 && styles.firstDaySection,
                    ]}
                  >
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayTitle}>Day {dayIndex + 1}</Text>
                      <TouchableOpacity
                        style={styles.addExerciseButton}
                        onPress={() => handleAddExercise(weekIndex, dayIndex)}
                      >
                        <Text style={styles.addExerciseIcon}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.exercisesContainer}>
                      {day.exercises.map((exercise, index) => (
                        <ExerciseItem
                          key={index}
                          exercise={exercise}
                          index={index}
                          weekIndex={weekIndex}
                          dayIndex={dayIndex}
                        />
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.bottomAddExerciseButton}
                      onPress={() => handleAddExercise(weekIndex, dayIndex)}
                    >
                      <View style={styles.bottomAddExerciseContent}>
                        <Icon name="add-outline" size={20} color="#666" />
                        <Text style={styles.bottomAddExerciseText}>
                          Add Exercise
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              : // For new blocks without data
                Array(block.sessionsPerWeek)
                  .fill(null)
                  .map((_, dayIndex) => (
                    <View
                      key={dayIndex}
                      style={[
                        styles.daySection,
                        dayIndex === 0 && styles.firstDaySection,
                      ]}
                    >
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayTitle}>Day {dayIndex + 1}</Text>
                        <TouchableOpacity
                          style={styles.addExerciseButton}
                          onPress={() =>
                            handleAddExercise(currentWeek - 1, dayIndex)
                          }
                        >
                          <Text style={styles.addExerciseIcon}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.exercisesContainer}>
                        <ExerciseItem
                          exercise={{
                            name: "",
                            sets: [
                              {
                                scheme: "",
                                weight: "0",
                                setCount: "1",
                              },
                            ],
                            notes: "",
                          }}
                          index={0}
                          weekIndex={currentWeek - 1}
                          dayIndex={dayIndex}
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.bottomAddExerciseButton}
                        onPress={() =>
                          handleAddExercise(currentWeek - 1, dayIndex)
                        }
                      >
                        <View style={styles.bottomAddExerciseContent}>
                          <Icon name="add-outline" size={20} color="#666" />
                          <Text style={styles.bottomAddExerciseText}>
                            Add Exercise
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
          </ScrollView>
        ))}
      </ScrollView>

      <View style={styles.weekNavigation}>
        <View style={styles.weekNavigationContent}>
          <ScrollView
            ref={weeksSliderRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weeksContainer}
          >
            {Array(totalWeeks)
              .fill(null)
              .map((_, index) => (
                <View key={index} style={styles.weekButtonWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.weekButton,
                      currentWeek === index + 1 && styles.weekButtonActive,
                    ]}
                    onPress={() => {
                      setIsProgrammaticScroll(true);
                      setCurrentWeek(index + 1);

                      scrollViewRef.current?.scrollTo({
                        x: index * width,
                        animated: true,
                      });

                      setTimeout(() => {
                        setIsProgrammaticScroll(false);
                      }, 300); // Match the animation duration
                    }}
                  >
                    <Text
                      style={[
                        styles.weekButtonText,
                        currentWeek === index + 1 &&
                          styles.weekButtonTextActive,
                      ]}
                    >
                      {weekNames[index]}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.renameButton}
                    onPress={() => handleRenameWeek(index)}
                  >
                    <Icon name="pencil-outline" size={14} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.addWeekButton}
            onPress={handleAddWeek}
          >
            <Icon name="add" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={isRenameModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsRenameModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rename Week</Text>
            <TextInput
              style={styles.modalInput}
              value={tempWeekName}
              onChangeText={setTempWeekName}
              placeholder="Enter week name"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsRenameModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveWeekName}
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
    paddingTop: 120,
    paddingBottom: 60,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginTop: -60,
    marginBottom: 40,
    position: "absolute",
    left: 0,
    top: -20,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    paddingTop: 8,
  },
  daySection: {
    marginBottom: 24,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: "#eaeaea",
    backgroundColor: "#fff",
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  firstDaySection: {
    paddingTop: 0,
    borderTopWidth: 0,
    marginTop: 0,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 0.3,
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
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 3,
  },
  exerciseContent: {
    flex: 1,
    padding: 12,
  },
  exerciseNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    padding: 0,
  },
  dragHandle: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  dragHandleText: {
    fontSize: 24,
    color: "#000",
    fontWeight: "bold",
  },
  exerciseDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
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
  },
  weightInput: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 90,
  },
  weightTextInput: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
    padding: 0,
    minWidth: 40,
    textAlign: "right",
  },
  weightUnitButton: {
    paddingLeft: 4,
    paddingVertical: 2,
  },
  weightUnit: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },
  noteContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  noteLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    fontWeight: "500",
  },
  noteInput: {
    fontSize: 13,
    color: "#000",
    lineHeight: 18,
    padding: 0,
  },
  weekNavigation: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  weekNavigationContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  weeksContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
    flexGrow: 1,
  },
  weekButtonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  weekButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  weekButtonActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  weekButtonTextActive: {
    color: "#fff",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  primaryButton: {
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  primaryButtonText: {
    color: "#000",
  },
  deleteButton: {
    borderColor: "#ffd5d5",
    backgroundColor: "#fff",
  },
  deleteButtonText: {
    color: "#FF3B30",
  },
  closeButton: {
    borderColor: "#000",
    backgroundColor: "#000",
    shadowColor: "#000",
    shadowOpacity: 0.25,
  },
  closeButtonText: {
    color: "#fff",
  },
  disabledButtonText: {
    opacity: 0.3,
  },
  renameButton: {
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
  addWeekButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  addSetButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    alignSelf: "flex-start",
    marginTop: 2,
    marginBottom: 8,
  },
  addSetButtonText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  bottomAddExerciseButton: {
    backgroundColor: "#f8f8f8",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomAddExerciseContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bottomAddExerciseText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export default WorkoutProgram;
