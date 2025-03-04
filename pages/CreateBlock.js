import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

const CreateBlock = ({ route }) => {
  const navigation = useNavigation();
  const { client, onCreateBlock } = route.params;
  const [blockName, setBlockName] = useState("");
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);

  // Add state for dates
  const today = new Date();
  const endDateDefault = new Date();
  endDateDefault.setDate(today.getDate() + 28); // 4 weeks from today by default

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(endDateDefault);

  // State for showing date pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const decrementSessions = () => {
    if (sessionsPerWeek > 1) {
      setSessionsPerWeek(sessionsPerWeek - 1);
    }
  };

  const incrementSessions = () => {
    if (sessionsPerWeek < 7) {
      setSessionsPerWeek(sessionsPerWeek + 1);
    }
  };

  // Date change handlers
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === "ios");
    setStartDate(currentDate);

    // If end date is before the new start date, update end date
    if (endDate < currentDate) {
      const newEndDate = new Date(currentDate);
      newEndDate.setDate(currentDate.getDate() + 28); // 4 weeks from start date
      setEndDate(newEndDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === "ios");
    setEndDate(currentDate);
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create New Block</Text>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Block Name</Text>
            <TextInput
              style={styles.input}
              value={blockName}
              onChangeText={setBlockName}
              placeholder="Enter block name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sessions per Week</Text>
            <View style={styles.sessionsSelector}>
              <Pressable
                style={[
                  styles.sessionControl,
                  sessionsPerWeek === 1 && styles.sessionControlDisabled,
                ]}
                onPress={decrementSessions}
                disabled={sessionsPerWeek === 1}
              >
                <Icon
                  name="remove"
                  size={24}
                  color={sessionsPerWeek === 1 ? "#ccc" : "#000"}
                />
              </Pressable>

              <View style={styles.sessionDisplay}>
                <Text style={styles.sessionNumber}>{sessionsPerWeek}</Text>
                <Text style={styles.sessionLabel}>sessions</Text>
              </View>

              <Pressable
                style={[
                  styles.sessionControl,
                  sessionsPerWeek === 7 && styles.sessionControlDisabled,
                ]}
                onPress={incrementSessions}
                disabled={sessionsPerWeek === 7}
              >
                <Icon
                  name="add"
                  size={24}
                  color={sessionsPerWeek === 7 ? "#ccc" : "#000"}
                />
              </Pressable>
            </View>
          </View>

          {/* Add date selection inputs */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Block Duration</Text>

            {/* Start Date Picker */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.dateLabel}>Start Date:</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                <Icon name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* End Date Picker */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.dateLabel}>End Date:</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                <Icon name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Date Pickers (visible conditionally) */}
            {showStartDatePicker && (
              <View style={styles.datePickerWrapper}>
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onStartDateChange}
                  minimumDate={today}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.doneDateButton}
                    onPress={() => setShowStartDatePicker(false)}
                  >
                    <Text style={styles.doneDateButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {showEndDatePicker && (
              <View style={styles.datePickerWrapper}>
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onEndDateChange}
                  minimumDate={startDate}
                />
                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.doneDateButton}
                    onPress={() => setShowEndDatePicker(false)}
                  >
                    <Text style={styles.doneDateButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Button fixed at the bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            (!blockName || !sessionsPerWeek) && styles.disabledButton,
          ]}
          onPress={() => {
            if (blockName && sessionsPerWeek) {
              onCreateBlock(blockName, sessionsPerWeek, startDate, endDate);
              navigation.goBack();
            }
          }}
          disabled={!blockName || !sessionsPerWeek}
        >
          <Text style={styles.createButtonText}>Create Block</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 24,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 100,
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  form: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: "#000",
  },
  sessionsSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  sessionControl: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: "#fff",
  },
  sessionControlDisabled: {
    backgroundColor: "#f8f8f8",
  },
  sessionDisplay: {
    alignItems: "center",
    paddingHorizontal: 30,
  },
  sessionNumber: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  sessionLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  // Date picker styles
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
    width: 100,
  },
  dateSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 15,
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  datePickerWrapper: {
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 0 : 10,
    alignItems: "center",
  },
  doneDateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
    marginRight: 10,
  },
  doneDateButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  createButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default CreateBlock;
