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

/**
 * ClientStats Component
 *
 * This component displays analytics for clients, including their PR progression charts.
 *
 * IMPORTANT: This file has been updated to fix the issue with missing plots.
 * The renderChart function now properly displays data points for months with actual data.
 */

// Define chart dimensions outside component so they're accessible to styles
const chartWidth = Dimensions.get("window").width - 110;
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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get current year and create array of last 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // Full month names for tooltips
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Mock data for testing
  const mockData = {
    johndoe: {
      name: "John Doe",
      joinDate: "2023",
      prData: {
        labels: monthNames.map((name) => name.substring(0, 3)),
        datasets: [
          {
            // Bench Press progression with data for every month and plateaus
            data: Array.from({ length: 12 }, (_, i) => {
              const baseWeight = 110;
              const monthlyIncrease = 2.5;
              // Add plateaus at months 4, 7, and 10
              if (i === 4 || i === 7 || i === 10) {
                return Math.round(baseWeight + monthlyIncrease * (i - 1));
              }
              return Math.round(baseWeight + monthlyIncrease * i);
            }),
            color: (opacity = 1) =>
              colors.benchPress +
              Math.round(opacity * 255)
                .toString(16)
                .padStart(2, "0"),
            strokeWidth: 3,
          },
          {
            // Squat progression with data for every month and plateaus
            data: Array.from({ length: 12 }, (_, i) => {
              const baseWeight = 160;
              const monthlyIncrease = 3.5;
              // Add plateaus at months 3, 6, and 9
              if (i === 3 || i === 6 || i === 9) {
                return Math.round(baseWeight + monthlyIncrease * (i - 1));
              }
              return Math.round(baseWeight + monthlyIncrease * i);
            }),
            color: (opacity = 1) =>
              colors.squat +
              Math.round(opacity * 255)
                .toString(16)
                .padStart(2, "0"),
            strokeWidth: 3,
          },
          {
            // Deadlift progression with data for every month and plateaus
            data: Array.from({ length: 12 }, (_, i) => {
              const baseWeight = 180;
              const monthlyIncrease = 4;
              // Add plateaus at months 2, 5, and 8
              if (i === 2 || i === 5 || i === 8) {
                return Math.round(baseWeight + monthlyIncrease * (i - 1));
              }
              return Math.round(baseWeight + monthlyIncrease * i);
            }),
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
          bench: { weight: 140, achievedAt: new Date(2023, 11, 15) },
          squat: { weight: 200, achievedAt: new Date(2023, 11, 20) },
          deadlift: { weight: 220, achievedAt: new Date(2023, 11, 25) },
        },
        dates: Array(12)
          .fill(null)
          .map((_, i) => new Date(2023, i, 15)),
        isPRMonth: Array(12).fill(true), // Every month is a PR month
        hasDataForMonth: Array(12).fill(true), // Every month has data
      },
    },
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    // Convert query to lowercase and trim whitespace for more robust matching
    const normalizedQuery = query.toLowerCase().trim();

    // Check if the query matches any client in mockData
    const matchedClient = Object.keys(mockData).find(
      (key) =>
        key.includes(normalizedQuery) ||
        mockData[key].name.toLowerCase().includes(normalizedQuery)
    );

    if (matchedClient) {
      setSelectedClient(mockData[matchedClient]);
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

  // Helper function to convert hex to rgb
  const hexToRgb = (hex) => {
    // Remove # if present
    hex = hex.replace("#", "");

    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  };

  // Function to get y-axis configuration based on the lift data
  const getYAxisConfig = (liftData) => {
    if (
      !liftData ||
      !liftData.datasets ||
      !liftData.datasets[0] ||
      !liftData.datasets[0].data
    ) {
      return {
        max: 250,
        min: 0,
        ticks: [0, 50, 100, 150, 200, 250],
      };
    }

    // Filter out null values
    const validData = liftData.datasets[0].data.filter(
      (val) => val !== null && val > 0
    );

    if (validData.length === 0) {
      return {
        max: 250,
        min: 0,
        ticks: [0, 50, 100, 150, 200, 250],
      };
    }

    const maxValue = Math.max(...validData);
    const minValue = Math.min(...validData);

    // Round up max to the next 50
    const roundedMax = Math.ceil(maxValue / 50) * 50;

    // Round down min to the previous 50 or 75% of min value, whichever is lower
    // This creates some space below the lowest data point
    const calculatedMin = Math.max(0, Math.floor((minValue * 0.75) / 50) * 50);

    const ticks = [];
    for (let i = calculatedMin; i <= roundedMax; i += 50) {
      ticks.push(i);
    }

    return {
      max: roundedMax,
      min: calculatedMin,
      ticks: ticks,
    };
  };

  const renderChart = (data, title, color, dataKey) => {
    if (!data) return null;

    // Get the dataset based on the dataKey
    const datasetIndex = dataKey === "bench" ? 0 : dataKey === "squat" ? 1 : 2;
    const rawData = data.datasets[datasetIndex].data;

    const yAxisConfig = getYAxisConfig({
      datasets: [{ data: rawData }],
    });

    const hasData = rawData.some(
      (value) => value !== null && value !== undefined && value > 0
    );

    if (!hasData) {
      return (
        <View style={styles.singleChartContainer}>
          <Text style={[styles.liftTitle, { color: color }]}>{title}</Text>
          <View style={styles.noDataContainer}>
            <Text style={styles.notMemberText}>
              No data available for {title}
            </Text>
          </View>
        </View>
      );
    }

    // Create a lighter version of the color for gradient
    const hexColor = color.startsWith("#") ? color : "#" + color;

    // Create chart data with all valid points
    const chartData = {
      labels: data.labels,
      datasets: [
        {
          data: rawData,
          color: () => hexColor,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <View style={styles.singleChartContainer}>
        <Text style={[styles.liftTitle, { color: color }]}>{title}</Text>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={CHART_HEIGHT}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.1})`,
            labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForBackgroundLines: {
              strokeDasharray: "6, 6",
              strokeWidth: 1,
              stroke: "rgba(230, 230, 230, 0.9)",
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#fff",
              fill: hexColor,
            },
            propsForLabels: {
              fontSize: 9,
              fontWeight: "500",
              fill: "#666",
            },
            fillShadowGradientOpacity: 0.1,
            fillShadowGradient: hexColor,
          }}
          bezier={false}
          style={{
            marginVertical: 8,
            borderRadius: 16,
            padding: 10,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#f0f0f0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={true}
          segments={4}
          yAxisInterval={1}
          yAxisMax={yAxisConfig.max}
          yAxisMin={yAxisConfig.min}
          yAxisSuffix="kg"
          formatYLabel={(value) => `${value}`}
          onDataPointClick={({ index }) => {
            const weight = rawData[index];
            const date = data.dates[index];
            const month = data.labels[index];

            // Create more detailed data point information
            setSelectedDataPoint({
              title: `${title} - ${month} ${selectedYear}`,
              value: weight,
              weight: weight,
              date,
              color,
              week: month,
              description: `${title} weight in ${month}`,
              subtitle: `Weight: ${weight}kg`,
            });

            setShowDataPointModal(true);
          }}
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

      {selectedClient ? (
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
      ) : (
        <View style={styles.noClientContainer}>
          <Icon name="search-outline" size={50} color="#ccc" />
          <Text style={styles.noClientText}>
            Search for a client to view their analytics
          </Text>
          <Text style={styles.noClientHint}>Try searching for "John Doe"</Text>
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
    height: 150,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginTop: 10,
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
    width: Dimensions.get("window").width - 80,
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  liftTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    paddingLeft: 10,
  },
  noDataContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginTop: 10,
  },
  noClientContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    margin: 20,
  },
  noClientText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  noClientHint: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

export default ClientStats;
