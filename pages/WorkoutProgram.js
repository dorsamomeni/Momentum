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
import { Alert } from "react-native";
import { updateBlock } from "../src/services/ProgramService";
import { logWorkoutSet } from "../src/services/workouts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../src/config/firebase";

const { width } = Dimensions.get("window");

const WorkoutProgram = ({ route }) => {
  const navigation = useNavigation();
  const { block, onCloseBlock, isPreviousBlock, onReopenBlock, isAthlete } =
    route.params;
  const { weightUnit, setWeightUnit } = useSettings();
  const days = Array(block.sessionsPerWeek).fill(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [totalWeeks, setTotalWeeks] = useState(block.weeks?.length || 1);
  const [currentDay, setCurrentDay] = useState(1);
  const [blockWeeks, setBlockWeeks] = useState(() => {
    if (block.weeks && block.weeks.length > 0) {
      return block.weeks;
    }

    return [
      {
        weekNumber: 1,
        days: Array(block.sessionsPerWeek)
          .fill()
          .map((_, dayIndex) => ({
            dayNumber: dayIndex + 1,
            exercises: [],
          })),
      },
    ];
  });

  const handleSubmitSession = async () => {
    try {
      const currentDayExercises =
        blockWeeks[currentWeek - 1]?.days[currentDay - 1]?.exercises || [];

      for (const exercise of currentDayExercises) {
        if (exercise.name && exercise.sets) {
          for (const set of exercise.sets) {
            if (set.weight) {
              await logWorkoutSet(block.athleteId, {
                name: exercise.name,
                weight: set.weight,
                scheme: set.scheme,
                blockId: block.id,
                weekNumber: currentWeek,
                dayNumber: currentDay,
                notes: exercise.notes || "",
                reps: set.reps,
                sets: set.setCount,
              });
            }
          }
        }
      }
      Alert.alert("Success", "Session logged successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error logging session:", error);
      Alert.alert("Error", "Failed to log session");
    }
  };

  const handleSubmitProgram = async () => {
    try {
      if (!blockWeeks) {
        throw new Error("No program data to submit");
      }

      const formattedWeeks = blockWeeks.map((week, weekIndex) => ({
        weekNumber: weekIndex + 1,
        days: week.days.map((day, dayIndex) => ({
          dayNumber: dayIndex + 1,
          exercises: day.exercises || [],
        })),
      }));

      const updateData = {
        weeks: formattedWeeks,
        status: "submitted",
        updatedAt: new Date().toISOString(),
      };

      await updateBlock(block.id, updateData);
      Alert.alert("Success", "Program submitted successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error submitting program:", error);
      Alert.alert("Error", "Failed to submit program");
    }
  };
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
      weekNumber: totalWeeks + 1,
      days: Array(block.sessionsPerWeek)
        .fill()
        .map((_, dayIndex) => ({
          dayNumber: dayIndex + 1,
          exercises: [],
        })),
    };

    const newTotalWeeks = totalWeeks + 1;
    const newWeekName = `Week ${newTotalWeeks}`;

    setIsProgrammaticScroll(true);

    setBlockWeeks([...blockWeeks, newWeek]);
    setTotalWeeks(newTotalWeeks);
    setWeekNames([...weekNames, newWeekName]);

    requestAnimationFrame(() => {
      setCurrentWeek(newTotalWeeks);

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

  const handleCopyWeek = () => {
    // Deep copy the current week with the correct structure
    const weekToCopy = {
      weekNumber: totalWeeks + 1,
      days: JSON.parse(JSON.stringify(blockWeeks[currentWeek - 1].days)).map(
        (day, index) => ({
          dayNumber: index + 1,
          exercises: day.exercises || [],
        })
      ),
    };

    const newTotalWeeks = totalWeeks + 1;
    const newWeekName = `Week ${newTotalWeeks}`;

    setIsProgrammaticScroll(true);

    // Update blockWeeks with the new week
    setBlockWeeks([...blockWeeks, weekToCopy]);
    setTotalWeeks(newTotalWeeks);
    setWeekNames([...weekNames, newWeekName]);

    requestAnimationFrame(() => {
      setCurrentWeek(newTotalWeeks);

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
      const updatedWeeks = blockWeeks
        .filter((_, index) => index !== currentWeek - 1)
        .map((week, index) => ({
          ...week,
          weekNumber: index + 1,
        }));

      setBlockWeeks(updatedWeeks);
      setTotalWeeks(totalWeeks - 1);
      setWeekNames(weekNames.filter((_, index) => index !== currentWeek - 1));

      if (currentWeek === totalWeeks) {
        setCurrentWeek(currentWeek - 1);
        scrollViewRef.current?.scrollTo({
          x: (currentWeek - 2) * width,
          animated: true,
        });
      } else {
        setCurrentWeek(currentWeek);
        scrollViewRef.current?.scrollTo({
          x: (currentWeek - 1) * width,
          animated: true,
        });
      }
    }
  };

  const handleReopenBlock = () => {
    onReopenBlock(block);
    navigation.goBack();
  };

  const handleCloseBlock = () => {
    onCloseBlock(block);
    navigation.goBack();
  };

  const handleAddExercise = (weekIndex, dayIndex) => {
    const newExercise = {
      name: "",
      sets: [
        {
          scheme: "",
          weight: "",
          setCount: "1",
        },
      ],
      notes: "",
    };

    const updatedWeeks = JSON.parse(JSON.stringify(blockWeeks));
    if (!updatedWeeks[weekIndex].days[dayIndex].exercises) {
      updatedWeeks[weekIndex].days[dayIndex].exercises = [];
    }
    updatedWeeks[weekIndex].days[dayIndex].exercises.push(newExercise);
    setBlockWeeks(updatedWeeks);
  };

  const handleAddSet = (weekIndex, dayIndex, exerciseIndex) => {
    const updatedWeeks = JSON.parse(JSON.stringify(blockWeeks));
    const exercise =
      updatedWeeks[weekIndex].days[dayIndex].exercises[exerciseIndex];

    if (!exercise.sets) {
      exercise.sets = [];
    }

    exercise.sets.push({
      scheme: "",
      weight: "",
      setCount: "1",
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
              editable={!isAthlete}
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
                  editable={!isAthlete}
                />
              </View>

              <View style={styles.weightInput}>
                <TextInput
                  style={styles.weightTextInput}
                  defaultValue={set.weight}
                  keyboardType="numeric"
                  placeholder="0"
                  editable={isAthlete && !isPreviousBlock}
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

          {!isAthlete && (
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => handleAddSet(weekIndex, dayIndex, index)}
            >
              <Text style={styles.addSetButtonText}>+ Add Set</Text>
            </TouchableOpacity>
          )}

          <View style={styles.noteContainer}>
            <Text style={styles.noteLabel}>Notes:</Text>
            <TextInput
              style={styles.noteInput}
              defaultValue={exercise.notes}
              placeholder="Add notes here"
              multiline
              editable={!isAthlete}
            />
          </View>
        </View>
      </View>
    );
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
          {isAthlete ? (
            <TouchableOpacity
              style={[
                styles.submitButton,
                isPreviousBlock && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitSession}
              disabled={isPreviousBlock}
            >
              <Text style={styles.submitButtonText}>Submit Session</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitProgram}
            >
              <Text style={styles.submitButtonText}>Submit Program</Text>
            </TouchableOpacity>
          )}
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
            {blockWeeks[weekIndex]?.days.map((day, dayIndex) => (
              <View
                key={dayIndex}
                style={[
                  styles.daySection,
                  dayIndex === 0 && styles.firstDaySection,
                ]}
              >
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>Day {dayIndex + 1}</Text>
                  {!isAthlete && (
                    <TouchableOpacity
                      style={styles.addExerciseButton}
                      onPress={() => handleAddExercise(weekIndex, dayIndex)}
                    >
                      <Text style={styles.addExerciseIcon}>+</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.exercisesContainer}>
                  {(day.exercises || []).map((exercise, index) => (
                    <ExerciseItem
                      key={index}
                      exercise={exercise}
                      index={index}
                      weekIndex={weekIndex}
                      dayIndex={dayIndex}
                    />
                  ))}
                </View>
                {!isAthlete && (
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
                )}
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
                    onPress={() => {
                      setSelectedWeekIndex(index);
                      setTempWeekName(weekNames[index]);
                      setIsRenameModalVisible(true);
                    }}
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
                onPress={() => {
                  if (selectedWeekIndex !== null && tempWeekName.trim()) {
                    const newWeekNames = [...weekNames];
                    newWeekNames[selectedWeekIndex] = tempWeekName.trim();
                    setWeekNames(newWeekNames);
                  }
                  setIsRenameModalVisible(false);
                }}
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
    paddingBottom: 90,
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
  exerciseContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  schemeContainer: {
    marginVertical: 4,
  },
  schemeText: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
  },
  addButton: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 4,
  },
  notes: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  loggedWeight: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 2,
  },
});

export default WorkoutProgram;
