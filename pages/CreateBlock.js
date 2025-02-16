import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

const CreateBlock = ({ route }) => {
  const navigation = useNavigation();
  const { client, onCreateBlock } = route.params;
  const [blockName, setBlockName] = useState("");
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);

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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create New Block</Text>

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

        <TouchableOpacity
          style={[
            styles.createButton,
            (!blockName || !sessionsPerWeek) && styles.disabledButton,
          ]}
          onPress={() => {
            if (blockName && sessionsPerWeek) {
              onCreateBlock(blockName, sessionsPerWeek);
              navigation.goBack();
            }
          }}
          disabled={!blockName || !sessionsPerWeek}
        >
          <Text style={styles.createButtonText}>Create Block</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 40,
    paddingBottom: 90,
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 40,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 30,
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
  createButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
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
