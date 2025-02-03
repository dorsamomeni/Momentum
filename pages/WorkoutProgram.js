import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const WorkoutProgram = ({ route }) => {
  const navigation = useNavigation();
  const { block } = route.params;
  const days = Array(block.sessionsPerWeek).fill(null);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{block.name}</Text>
      <Text style={styles.subtitle}>
        {block.startDate} - {block.endDate}
      </Text>

      <ScrollView style={styles.programContainer}>
        {days.map((_, index) => (
          <View key={index} style={styles.daySection}>
            <Text style={styles.dayTitle}>Day {index + 1}</Text>
            <View style={styles.exercisesContainer}>
              {index === 0 && (
                // Main Squat Day
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Competition Squat"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="5 x 3 @ RPE 8"
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
                        defaultValue="Competition stance, pause at parallel"
                        placeholder="Add notes here"
                        multiline
                      />
                    </View>
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Pause Squats"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="3 x 2 @ RPE 7"
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
                        defaultValue="3 second pause at bottom"
                        placeholder="Add notes here"
                        multiline
                      />
                    </View>
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Split Squats"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="3 x 8 each @ RPE 7"
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
                  </View>
                </>
              )}
              {index === 1 && (
                // Main Bench Day
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Competition Bench"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="5 x 3 @ RPE 8"
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
                        defaultValue="Competition pause, full leg drive"
                        placeholder="Add notes here"
                        multiline
                      />
                    </View>
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Close Grip Bench"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="3 x 5 @ RPE 7"
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
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="DB Bench"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="3 x 8 @ RPE 7"
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
                  </View>
                </>
              )}
              {index === 2 && (
                // Main Deadlift Day
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Competition Deadlift"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="5 x 2 @ RPE 8"
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
                        defaultValue="Competition stance, control descent"
                        placeholder="Add notes here"
                        multiline
                      />
                    </View>
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Deficit Deadlifts"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="3 x 3 @ RPE 7"
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
                        defaultValue="2-inch deficit"
                        placeholder="Add notes here"
                        multiline
                      />
                    </View>
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Back Extensions"
                      placeholder="Exercise name"
                    />
                    <View style={styles.exerciseDetails}>
                      <View style={styles.setScheme}>
                        <TextInput
                          style={styles.schemeInput}
                          defaultValue="3 x 12 @ RPE 7"
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
                  </View>
                </>
              )}
              {index === 3 && (
                // Shoulders
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Military Press"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="4 sets x 8-10 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Lateral Raises"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 12-15 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Front Raises"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 12-15 reps"
                    />
                  </View>
                </>
              )}
              {index === 4 && (
                // Arms
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Hammer Curls"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 12-15 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Rope Pushdowns"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 12-15 reps"
                    />
                  </View>
                </>
              )}
              {index === 5 && (
                // Upper Body
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="DB Shoulder Press"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 10-12 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Cable Rows"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 12-15 reps"
                    />
                  </View>
                </>
              )}
              {index === 6 && (
                // Lower Body
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Front Squats"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="4 sets x 8-10 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Leg Press"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 10-12 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Walking Lunges"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 12 reps"
                    />
                  </View>
                </>
              )}
              {index === 7 && (
                // Full Body
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Deadlifts"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="4 sets x 6-8 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Pull-ups"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x max reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Push-ups"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x max reps"
                    />
                  </View>
                </>
              )}
              {index > 7 && (
                // Additional days
                <>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Exercise 1"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 10-12 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Exercise 2"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 12-15 reps"
                    />
                  </View>
                  <View style={styles.exercise}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      defaultValue="Exercise 3"
                      placeholder="Exercise name"
                    />
                    <TextInput
                      style={styles.exerciseDetails}
                      defaultValue="3 sets x 12-15 reps"
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 120,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 6,
    marginBottom: 32,
  },
  programContainer: {
    flex: 1,
  },
  daySection: {
    marginBottom: 32,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
    paddingHorizontal: 4,
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
});

export default WorkoutProgram;
