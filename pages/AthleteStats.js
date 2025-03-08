import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../src/config/firebase";
import { doc, getDoc } from "firebase/firestore";

const AthleteStats = () => {
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

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

  // Pastel colors for charts
  const colors = {
    benchPress: "#FFB6C1", // Pastel pink
    squat: "#ADD8E6", // Pastel blue
    deadlift: "#90EE90", // Pastel green
  };

  // Convert lbs to kg
  const lbsToKg = (lbs) => {
    return Math.round((lbs / 2.20462) * 10) / 10; // Convert and round to 1 decimal
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (tooltipData) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [tooltipData]);

  // Example PR data separated by lift type with exact dates - replace this with real data from your database
  const benchPressData = {
    labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    datasets: [
      {
        data: [110, 115, 120, 122, 125, 128, 130, 133, 135, 137, 138, 140].map(
          lbsToKg
        ),
        color: (opacity = 1) => `rgba(255, 182, 193, ${opacity})`, // Pastel pink
        strokeWidth: 3,
      },
    ],
    // Exact dates for each data point
    dates: [
      "2023-01-12",
      "2023-02-05",
      "2023-03-18",
      "2023-04-09",
      "2023-05-23",
      "2023-06-14",
      "2023-07-02",
      "2023-08-19",
      "2023-09-11",
      "2023-10-27",
      "2023-11-15",
      "2023-12-08",
    ],
  };

  const squatData = {
    labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    datasets: [
      {
        data: [160, 165, 170, 175, 180, 185, 188, 190, 193, 195, 198, 200].map(
          lbsToKg
        ),
        color: (opacity = 1) => `rgba(173, 216, 230, ${opacity})`, // Pastel blue
        strokeWidth: 3,
      },
    ],
    // Exact dates for each data point
    dates: [
      "2023-01-05",
      "2023-02-18",
      "2023-03-12",
      "2023-04-22",
      "2023-05-10",
      "2023-06-28",
      "2023-07-16",
      "2023-08-02",
      "2023-09-19",
      "2023-10-05",
      "2023-11-22",
      "2023-12-14",
    ],
  };

  const deadliftData = {
    labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    datasets: [
      {
        data: [180, 185, 190, 195, 200, 205, 208, 210, 213, 215, 218, 220].map(
          lbsToKg
        ),
        color: (opacity = 1) => `rgba(144, 238, 144, ${opacity})`, // Pastel green
        strokeWidth: 3,
      },
    ],
    // Exact dates for each data point
    dates: [
      "2023-01-19",
      "2023-02-10",
      "2023-03-05",
      "2023-04-16",
      "2023-05-31",
      "2023-06-22",
      "2023-07-09",
      "2023-08-26",
      "2023-09-07",
      "2023-10-18",
      "2023-11-29",
      "2023-12-05",
    ],
  };

  // Format date string to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setShowYearDropdown(false);
    setTooltipData(null); // Clear tooltip when year changes
    // In a real app, you would fetch data for the selected year here
  };

  // Handler for dot press - only called when a dot is actually clicked
  const handleDotPress = (data, dataPointIndex, liftType, x, y) => {
    // If we're already showing this tooltip, hide it (toggle behavior)
    if (
      tooltipData &&
      tooltipData.liftType === liftType &&
      tooltipData.index === dataPointIndex
    ) {
      setTooltipData(null);
      return;
    }

    // Get the data for this point and set tooltip immediately (no delay)
    const weight = data.datasets[0].data[dataPointIndex];
    const exactDate = data.dates ? data.dates[dataPointIndex] : null;

    setTooltipData({
      weight,
      liftType,
      color: data.datasets[0].color(1),
      index: dataPointIndex,
      exactDate,
      // Store position for proper placement
      x,
      y,
    });
  };

  // Custom tooltip component
  const Tooltip = ({ tooltipData, color }) => {
    if (!tooltipData) return null;

    return (
      <Animated.View
        style={[
          styles.tooltip,
          {
            borderColor: color,
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.tooltipTitle}>{tooltipData.liftType}</Text>
        <Text style={styles.tooltipWeight}>{tooltipData.weight} kg</Text>
        {tooltipData.exactDate ? (
          <Text style={styles.tooltipDate}>
            {formatDate(tooltipData.exactDate)}
          </Text>
        ) : (
          <Text style={styles.tooltipDate}>
            {monthNames[tooltipData.index]} {selectedYear}
          </Text>
        )}
      </Animated.View>
    );
  };

  const NotMemberMessage = () => (
    <View style={styles.notMemberContainer}>
      <Text style={styles.notMemberText}>
        No data available for {selectedYear}
      </Text>
    </View>
  );

  // Common chart configuration
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#f9f9f9",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(70, 70, 70, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(70, 70, 70, ${opacity})`,
    strokeWidth: 3,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffffff",
    },
    propsForBackgroundLines: {
      strokeDasharray: "", // Solid lines for grid
      stroke: "rgba(230, 230, 230, 0.9)",
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "bold",
    },
    // Y-axis settings
    withInnerLines: true,
    withOuterLines: true,
    withVerticalLines: false,
    withHorizontalLines: true,
  };

  const chartStyle = {
    marginVertical: 12,
    borderRadius: 16,
    paddingRight: 10,
    paddingLeft: 45, // Increased left padding for y-axis values
    paddingTop: 20, // Increased top padding to prevent overlap with header
    paddingBottom: 10, // Added bottom padding
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    backgroundColor: "#fff",
  };

  const chartWidth = Dimensions.get("window").width - 85;
  const chartHeight = 200; // Slightly taller charts for better visibility

  const renderChart = (data, title, color) => {
    const isSelected = tooltipData && tooltipData.liftType === title;

    // Find min and max values for better Y-axis scaling with nice round numbers
    const allValues = data.datasets[0].data;
    const minDataValue = Math.min(...allValues);
    const maxDataValue = Math.max(...allValues);

    // Round down to nearest 10 for min, round up to nearest 10 for max
    const minValue = Math.floor(minDataValue / 10) * 10;
    const maxValue = Math.ceil(maxDataValue / 10) * 10;

    // Use fixed interval of 10kg for consistency
    const yAxisInterval = 10;

    // Calculate how many steps we need
    const steps = Math.ceil((maxValue - minValue) / yAxisInterval);

    return (
      <View style={styles.singleChartContainer}>
        {/* Chart title and badges in a separate container with more spacing */}
        <View style={styles.titleContainer}>
          <View style={styles.chartHeaderContainer}>
            <Text style={[styles.liftTitle, { color }]}>{title}</Text>
            <View style={[styles.liftBadge, { backgroundColor: color }]}>
              <Text style={styles.liftBadgeText}>
                {data.datasets[0].data[data.datasets[0].data.length - 1]} kg
              </Text>
            </View>
          </View>

          {/* Tooltip positioned between title and chart */}
          {isSelected && tooltipData && (
            <View style={styles.fixedTooltipWrapper}>
              <Tooltip tooltipData={tooltipData} color={color} />
            </View>
          )}
        </View>

        {parseInt(selectedYear) >=
        parseInt(userData?.joinDate || currentYear) ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={data}
              width={chartWidth}
              height={chartHeight}
              chartConfig={{
                ...chartConfig,
                propsForDots: (dataPoint, index) => {
                  // Highlight selected dot
                  if (
                    isSelected &&
                    tooltipData &&
                    tooltipData.index === index
                  ) {
                    return {
                      r: "9",
                      strokeWidth: "3",
                      stroke: "white",
                      fill: color,
                    };
                  }
                  // Regular dots
                  return {
                    r: "5",
                    strokeWidth: "2",
                    stroke: "white",
                    fill: color,
                  };
                },
              }}
              bezier
              style={chartStyle}
              fromZero={false}
              formatYLabel={(value) => `${value}`} // Clean numerical display
              segments={steps}
              yAxisSuffix=" kg"
              yAxisInterval={yAxisInterval}
              onDataPointClick={({ value, dataset, getColor, index, x, y }) => {
                // Only process legitimate dot clicks
                if (x && y) {
                  handleDotPress(data, index, title, x, y);
                }
              }}
              withDots={true}
              withShadow={true}
              transparent={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              yAxisLabel=""
              showBarTops={false}
              // Set min and max values for better Y-axis scaling
              fromValue={minValue}
              toValue={maxValue}
            />

            {/* Y-axis custom numeric values with consistent intervals */}
            <View style={styles.yAxisValueContainer}>
              {Array.from({ length: steps + 1 }).map((_, i) => {
                const value = minValue + i * yAxisInterval;
                const yPosition =
                  chartHeight -
                  ((value - minValue) / (maxValue - minValue)) * chartHeight;
                return (
                  <Text
                    key={i}
                    style={[
                      styles.yAxisValue,
                      { top: yPosition - 6 }, // Adjust for text height
                    ]}
                  >
                    {value}
                  </Text>
                );
              })}
            </View>
          </View>
        ) : (
          <NotMemberMessage />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Analytics</Text>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.clientName}>
              {userData?.firstName} {userData?.lastName}
            </Text>
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

        {renderChart(benchPressData, "Bench Press", colors.benchPress)}
        {renderChart(squatData, "Squat", colors.squat)}
        {renderChart(deadliftData, "Deadlift", colors.deadlift)}

        {/* Touch area to clear tooltip when tapping elsewhere */}
        <TouchableOpacity
          style={styles.clearTooltipArea}
          activeOpacity={1}
          onPress={() => setTooltipData(null)}
        />
      </ScrollView>

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
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
  },
  singleChartContainer: {
    marginBottom: 45, // Increased bottom margin for more space between charts
    width: "100%",
    position: "relative",
  },
  titleContainer: {
    marginBottom: 25, // Increased space between title and chart
    paddingHorizontal: 8,
    // Removed background color to prevent overlap issues
  },
  chartContainer: {
    position: "relative",
    marginTop: 5, // Reduced margin to prevent gap
  },
  tooltipWrapper: {
    position: "absolute",
    zIndex: 100,
  },
  fixedTooltipWrapper: {
    marginTop: 10,
    marginBottom: 10, // Increased bottom margin
    alignItems: "center",
    width: "100%",
  },
  tooltip: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    borderLeftWidth: 3,
    position: "relative",
  },
  tooltipArrow: {
    position: "absolute",
    width: 10,
    height: 10,
    bottom: -5,
    left: "50%",
    marginLeft: -5,
    transform: [{ rotate: "45deg" }],
  },
  chartHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8, // Increased bottom margin
    paddingHorizontal: 5,
  },
  liftTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  liftBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  liftBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  tooltipTitle: {
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 2,
  },
  tooltipWeight: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  tooltipDate: {
    fontSize: 11,
    color: "#666",
  },
  clearTooltipArea: {
    height: 50,
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
    height: 180,
  },
  notMemberText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  yAxisValueContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 45, // Increased width for y-axis values
    paddingRight: 8,
    paddingTop: 20, // Match chart padding
    paddingBottom: 10, // Match chart padding
    justifyContent: "space-between",
    alignItems: "flex-end",
    backgroundColor: "transparent", // Changed to transparent
    zIndex: 10,
  },
  yAxisValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#555",
    textAlign: "right",
    position: "absolute",
    right: 8,
  },
});

export default AthleteStats;
