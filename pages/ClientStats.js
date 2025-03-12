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

// Define chart dimensions outside component so they're accessible to styles
const chartWidth = Dimensions.get("window").width - 85;
const CHART_HEIGHT = 200;

// Pastel colors for charts
const colors = {
  benchPress: "#FFB6C1", // Pastel pink
  squat: "#ADD8E6", // Pastel blue
  deadlift: "#90EE90", // Pastel green
};

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
            color: (opacity = 1) =>
              colors.benchPress +
              Math.round(opacity * 255)
                .toString(16)
                .padStart(2, "0"),
            strokeWidth: 3,
          },
          {
            data: [160, 165, 170, 175, 180, 185, 188, 190, 193, 195, 198, 200],
            color: (opacity = 1) =>
              colors.squat +
              Math.round(opacity * 255)
                .toString(16)
                .padStart(2, "0"),
            strokeWidth: 3,
          },
          {
            data: [180, 185, 190, 195, 200, 205, 208, 210, 213, 215, 218, 220],
            color: (opacity = 1) =>
              colors.deadlift +
              Math.round(opacity * 255)
                .toString(16)
                .padStart(2, "0"),
            strokeWidth: 3,
          },
        ],
        legend: ["Bench Press", "Squat", "Deadlift"],
        currentMaxes: {
          bench: { weight: 140 },
          squat: { weight: 200 },
          deadlift: { weight: 220 },
        },
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

  const renderChart = (data, title, color, dataKey) => {
    if (!data) return null;

    return (
      <View style={styles.singleChartContainer}>
        <Text style={[styles.liftTitle, { color: color }]}>{title}</Text>
        <LineChart
          data={{
            labels: data.labels,
            datasets: [
              {
                data:
                  dataKey === "bench"
                    ? data.datasets[0].data
                    : dataKey === "squat"
                    ? data.datasets[1].data
                    : data.datasets[2].data,
                color: (opacity = 1) =>
                  color +
                  Math.round(opacity * 255)
                    .toString(16)
                    .padStart(2, "0"),
                strokeWidth: 3,
              },
            ],
          }}
          width={chartWidth}
          height={CHART_HEIGHT}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 1,
            barPercentage: 0.5,
            useShadowColorFromDataset: true,
            fillShadowGradientOpacity: 0.2,
            propsForBackgroundLines: {
              strokeDasharray: "5, 5",
              strokeWidth: 1,
              stroke: "rgba(0, 0, 0, 0.1)",
            },
            paddingLeft: 15,
            paddingRight: 15,
            paddingTop: 30,
            paddingBottom: 25,
            propsForLabels: {
              fontSize: 10,
              fontWeight: "400",
            },
            propsForDots: {
              r: "5",
              strokeWidth: "2",
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            padding: 10,
            paddingBottom: 30,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#f0f0f0",
            marginBottom: 25,
          }}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          segments={5}
          yAxisSuffix="kg"
        />
      </View>
    );
  };

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
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
        >
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

            {/* Current Max Lifts Display */}
            <View style={styles.maxLiftsContainer}>
              <TouchableOpacity
                style={[styles.maxLiftCard, { borderColor: colors.squat }]}
              >
                <Text style={styles.maxLiftLabel}>Squat</Text>
                <Text style={styles.maxLiftValue}>
                  {selectedClient.prData.currentMaxes.squat.weight} kg
                </Text>
                <Icon
                  name="calendar-outline"
                  size={12}
                  color="#666"
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.maxLiftCard, { borderColor: colors.benchPress }]}
              >
                <Text style={styles.maxLiftLabel}>Bench</Text>
                <Text style={styles.maxLiftValue}>
                  {selectedClient.prData.currentMaxes.bench.weight} kg
                </Text>
                <Icon
                  name="calendar-outline"
                  size={12}
                  color="#666"
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.maxLiftCard, { borderColor: colors.deadlift }]}
              >
                <Text style={styles.maxLiftLabel}>Deadlift</Text>
                <Text style={styles.maxLiftValue}>
                  {selectedClient.prData.currentMaxes.deadlift.weight} kg
                </Text>
                <Icon
                  name="calendar-outline"
                  size={12}
                  color="#666"
                  style={styles.calendarIcon}
                />
              </TouchableOpacity>
            </View>

            {parseInt(selectedYear) >= parseInt(selectedClient.joinDate) ? (
              <>
                {renderChart(
                  selectedClient.prData,
                  "Squat",
                  colors.squat,
                  "squat"
                )}
                {renderChart(
                  selectedClient.prData,
                  "Bench Press",
                  colors.benchPress,
                  "bench"
                )}
                {renderChart(
                  selectedClient.prData,
                  "Deadlift",
                  colors.deadlift,
                  "deadlift"
                )}
              </>
            ) : (
              <NotMemberMessage />
            )}
          </View>
        </ScrollView>
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
    paddingTop: 100,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 20,
  },
  clientName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "500",
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
    height: 180,
  },
  notMemberText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  maxLiftsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  maxLiftCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 3,
    alignItems: "center",
  },
  maxLiftLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  maxLiftValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  calendarIcon: {
    marginTop: 2,
  },
  singleChartContainer: {
    marginBottom: 30,
    width: "100%",
    paddingHorizontal: 5,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  liftTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    paddingLeft: 10,
  },
});

export default ClientStats;
