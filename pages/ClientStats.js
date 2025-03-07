import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../src/config/firebase";

const ClientStats = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Get current year and create array of last 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // Mock data for testing
  const mockData = {
    johndoe: {
      name: "John Doe",
      joinDate: "2024",
      prData: {
        labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
        datasets: [
          {
            data: [110, 115, 120, 122, 125, 128, 130, 133, 135, 137, 138, 140],
            color: (opacity = 1) => `rgba(255, 182, 193, ${opacity})`,
          },
          {
            data: [160, 165, 170, 175, 180, 185, 188, 190, 193, 195, 198, 200],
            color: (opacity = 1) => `rgba(176, 224, 230, ${opacity})`,
          },
          {
            data: [180, 185, 190, 195, 200, 205, 208, 210, 213, 215, 218, 220],
            color: (opacity = 1) => `rgba(144, 238, 144, ${opacity})`,
          },
        ],
        legend: ["Bench Press", "Squat", "Deadlift"],
      },
    },
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (mockData[query.toLowerCase()]) {
      setSelectedClient(mockData[query.toLowerCase()]);
    } else {
      setSelectedClient(null);
    }
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setShowYearDropdown(false);
  };

  const NotMemberMessage = () => (
    <View style={styles.notMemberContainer}>
      <Text style={styles.notMemberText}>
        {selectedClient.name} wasn't a member in {selectedYear}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client Analytics</Text>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Clients"
          placeholderTextColor="#666"
          autoCapitalize="none"
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
      </View>

      {selectedClient && (
        <View style={styles.chartContainer}>
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.clientName}>{selectedClient.name}</Text>
              <Text style={styles.chartTitle}>PR Progression</Text>
            </View>
            <TouchableOpacity
              style={styles.yearContainer}
              onPress={() => setShowYearDropdown(true)}
            >
              <Text style={styles.yearLabel}>{selectedYear}</Text>
              <Icon
                name="chevron-down"
                size={16}
                color="#666"
                style={styles.dropdownIcon}
              />
            </TouchableOpacity>
          </View>

          {parseInt(selectedYear) >= parseInt(selectedClient.joinDate) ? (
            <LineChart
              data={selectedClient.prData}
              width={Dimensions.get("window").width - 80}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
              legend={selectedClient.prData.legend}
            />
          ) : (
            <NotMemberMessage />
          )}
        </View>
      )}

      <Modal
        visible={showYearDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowYearDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowYearDropdown(false)}
        >
          <View style={styles.dropdownContainer}>
            <ScrollView>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearOption,
                    selectedYear === year && styles.selectedYearOption,
                  ]}
                  onPress={() => handleYearSelect(year)}
                >
                  <Text
                    style={[
                      styles.yearOptionText,
                      selectedYear === year && styles.selectedYearOptionText,
                    ]}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 60,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    width: "100%",
    alignSelf: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
  },
  chartContainer: {
    marginTop: 20,
    width: "100%",
  },
  clientName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "flex-start",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 20,
  },
  yearContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: 5,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  dropdownIcon: {
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    width: "40%",
    maxHeight: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  yearOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedYearOption: {
    backgroundColor: "#f8f8f8",
  },
  yearOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  selectedYearOptionText: {
    fontWeight: "600",
  },
  notMemberContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 220,
  },
  notMemberText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default ClientStats;
