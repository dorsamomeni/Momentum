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
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../src/config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

// Define chart dimensions outside component so they're accessible to styles
const chartWidth = Dimensions.get("window").width - 85;
const CHART_HEIGHT = 200; // Constant for chart height used in styles

const AthleteStats = () => {
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isLoading, setIsLoading] = useState(true);

  // State for progression data
  const [squatData, setSquatData] = useState(null);
  const [benchData, setBenchData] = useState(null);
  const [deadliftData, setDeadliftData] = useState(null);

  // State for update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newSquatMax, setNewSquatMax] = useState("");
  const [newBenchMax, setNewBenchMax] = useState("");
  const [newDeadliftMax, setNewDeadliftMax] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // State for current maxes and dates
  const [currentMaxes, setCurrentMaxes] = useState({
    squat: { weight: 0, achievedAt: null },
    bench: { weight: 0, achievedAt: null },
    deadlift: { weight: 0, achievedAt: null },
  });

  // State for showing max date modal
  const [showMaxDateModal, setShowMaxDateModal] = useState(false);
  const [selectedMax, setSelectedMax] = useState(null);

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

  // Update max lifts
  const handleUpdateMaxes = async () => {
    // Validate inputs - at least one field should be filled
    if (!newSquatMax && !newBenchMax && !newDeadliftMax) {
      Alert.alert("Error", "Please enter at least one max lift to update");
      return;
    }

    // Validate that entered values are valid numbers
    if (
      (newSquatMax && isNaN(parseFloat(newSquatMax))) ||
      (newBenchMax && isNaN(parseFloat(newBenchMax))) ||
      (newDeadliftMax && isNaN(parseFloat(newDeadliftMax)))
    ) {
      Alert.alert("Error", "Please enter valid numbers for all lifts");
      return;
    }

    setIsUpdating(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      const now = new Date();
      const analyticsRef = doc(db, "analytics", user.uid);

      // Get current document to check if it exists
      const analyticsDoc = await getDoc(analyticsRef);

      if (analyticsDoc.exists()) {
        // Prepare updates object - only include fields that have values
        const updates = {};
        const progressionUpdates = {};

        if (newSquatMax) {
          updates["currentMaxes.squat"] = {
            weight: parseFloat(newSquatMax),
            achievedAt: serverTimestamp(),
          };
          progressionUpdates["squatProgression"] = arrayUnion({
            date: now,
            weight: parseFloat(newSquatMax),
          });
        }

        if (newBenchMax) {
          updates["currentMaxes.bench"] = {
            weight: parseFloat(newBenchMax),
            achievedAt: serverTimestamp(),
          };
          progressionUpdates["benchProgression"] = arrayUnion({
            date: now,
            weight: parseFloat(newBenchMax),
          });
        }

        if (newDeadliftMax) {
          updates["currentMaxes.deadlift"] = {
            weight: parseFloat(newDeadliftMax),
            achievedAt: serverTimestamp(),
          };
          progressionUpdates["deadliftProgression"] = arrayUnion({
            date: now,
            weight: parseFloat(newDeadliftMax),
          });
        }

        // Update the current max lifts and progression arrays
        await updateDoc(analyticsRef, { ...updates, ...progressionUpdates });

        // Refresh data
        await loadUserData();
        Alert.alert("Success", "Your max lifts have been updated");
      } else {
        Alert.alert(
          "Error",
          "Could not update maxes. Analytics data not found."
        );
      }

      // Close modal and clear inputs
      setShowUpdateModal(false);
      setNewSquatMax("");
      setNewBenchMax("");
      setNewDeadliftMax("");
    } catch (error) {
      console.error("Error updating max lifts:", error);
      Alert.alert(
        "Error",
        "Failed to update your max lifts. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (user) {
        // Get user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUserData(userDoc.data());

        // Get analytics data
        const analyticsDoc = await getDoc(doc(db, "analytics", user.uid));

        if (analyticsDoc.exists()) {
          const analyticsData = analyticsDoc.data();

          // Store current maxes data
          if (analyticsData.currentMaxes) {
            setCurrentMaxes({
              squat: analyticsData.currentMaxes.squat || {
                weight: 0,
                achievedAt: null,
              },
              bench: analyticsData.currentMaxes.bench || {
                weight: 0,
                achievedAt: null,
              },
              deadlift: analyticsData.currentMaxes.deadlift || {
                weight: 0,
                achievedAt: null,
              },
            });
          }

          // Process squat data
          if (
            analyticsData.squatProgression &&
            analyticsData.squatProgression.length > 0
          ) {
            const formattedSquatData = processProgressionData(
              analyticsData.squatProgression
            );
            setSquatData(formattedSquatData);
          } else {
            setSquatData(createEmptyDataset());
          }

          // Process bench data
          if (
            analyticsData.benchProgression &&
            analyticsData.benchProgression.length > 0
          ) {
            const formattedBenchData = processProgressionData(
              analyticsData.benchProgression
            );
            setBenchData(formattedBenchData);
          } else {
            setBenchData(createEmptyDataset());
          }

          // Process deadlift data
          if (
            analyticsData.deadliftProgression &&
            analyticsData.deadliftProgression.length > 0
          ) {
            const formattedDeadliftData = processProgressionData(
              analyticsData.deadliftProgression
            );
            setDeadliftData(formattedDeadliftData);
          } else {
            setDeadliftData(createEmptyDataset());
          }

          // Pre-fill the max lift input fields if available
          if (analyticsData.currentMaxes) {
            if (analyticsData.currentMaxes.squat?.weight) {
              setNewSquatMax(
                analyticsData.currentMaxes.squat.weight.toString()
              );
            }
            if (analyticsData.currentMaxes.bench?.weight) {
              setNewBenchMax(
                analyticsData.currentMaxes.bench.weight.toString()
              );
            }
            if (analyticsData.currentMaxes.deadlift?.weight) {
              setNewDeadliftMax(
                analyticsData.currentMaxes.deadlift.weight.toString()
              );
            }
          }
        } else {
          // No analytics data, set empty datasets
          setSquatData(createEmptyDataset());
          setBenchData(createEmptyDataset());
          setDeadliftData(createEmptyDataset());
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Set empty datasets on error
      setSquatData(createEmptyDataset());
      setBenchData(createEmptyDataset());
      setDeadliftData(createEmptyDataset());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  // Process progression data from Firestore into chart format
  const processProgressionData = (progressionArray) => {
    // Get current date and week number
    const currentDate = new Date();
    const startOfCurrentYear = new Date(currentDate.getFullYear(), 0, 1);
    const currentDays = Math.floor(
      (currentDate - startOfCurrentYear) / (24 * 60 * 60 * 1000)
    );
    const currentWeekNumber = Math.ceil(
      (currentDays + startOfCurrentYear.getDay() + 1) / 7
    );

    // Filter for current year and sort progression by date
    const currentYear = currentDate.getFullYear().toString();
    const currentYearData = progressionArray.filter((entry) => {
      const entryDate =
        entry.date instanceof Date ? entry.date : entry.date.toDate();
      return entryDate.getFullYear().toString() === selectedYear;
    });

    const sortedProgression = [...currentYearData].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : a.date.toDate();
      const dateB = b.date instanceof Date ? b.date : b.date.toDate();
      return dateA - dateB;
    });

    // Create array of all weeks that have passed so far
    const weekLabels = Array.from(
      { length: selectedYear === currentYear ? currentWeekNumber : 52 },
      (_, i) => `${i + 1}`
    );

    // Maps to store data by week number
    const weekDataMap = new Map();
    const weekDatesMap = new Map();

    // Process data by week
    sortedProgression.forEach((entry) => {
      const entryDate =
        entry.date instanceof Date ? entry.date : entry.date.toDate();

      // Calculate week number (1-52)
      const startOfYear = new Date(entryDate.getFullYear(), 0, 1);
      const days = Math.floor(
        (entryDate - startOfYear) / (24 * 60 * 60 * 1000)
      );
      const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

      // Only include if week number is within our display range
      if (weekNumber <= weekLabels.length) {
        // For multiple entries in the same week, keep the latest one
        weekDataMap.set(weekNumber, entry.weight);
        weekDatesMap.set(weekNumber, entryDate.toISOString().split("T")[0]);
      }
    });

    // Fill in the data array based on our week labels
    const data = [];
    const dates = [];
    const validLabels = [];

    // Only include weeks with data and all weeks up to the most recent data point
    let lastDataWeek = 0;
    weekLabels.forEach((label, index) => {
      const weekNumber = index + 1;
      if (weekDataMap.has(weekNumber)) {
        data.push(weekDataMap.get(weekNumber));
        dates.push(weekDatesMap.get(weekNumber));
        validLabels.push(label);
        lastDataWeek = weekNumber;
      }
    });

    // If no data points, return an empty chart structure
    if (data.length === 0) {
      return createEmptyDataset();
    }

    return {
      labels: validLabels,
      datasets: [
        {
          data,
          strokeWidth: 3,
        },
      ],
      dates,
    };
  };

  // Create empty dataset for when no data is available
  const createEmptyDataset = () => {
    // Get current week of the year
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const currentDays = Math.floor(
      (currentDate - startOfYear) / (24 * 60 * 60 * 1000)
    );
    const currentWeekNumber = Math.ceil(
      (currentDays + startOfYear.getDay() + 1) / 7
    );

    // Only show weeks that have passed so far this year
    const weeksToShow =
      selectedYear === currentDate.getFullYear().toString()
        ? currentWeekNumber
        : 52;
    const labels = Array.from({ length: weeksToShow }, (_, i) => `W${i + 1}`);

    // If no weeks have passed yet or no labels, show at least W1
    if (labels.length === 0) {
      labels.push("W1");
    }

    return {
      labels,
      datasets: [
        {
          data: [0],
          strokeWidth: 3,
        },
      ],
      dates: [new Date().toISOString().split("T")[0]],
    };
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
    const label = data.labels ? data.labels[dataPointIndex] : null;

    setTooltipData({
      weight,
      liftType,
      color: data.datasets[0].color(1),
      index: dataPointIndex,
      exactDate,
      label,
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
            Week {tooltipData.label?.substring(1)} / {selectedYear}
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

  // Function to get y-axis configuration based on the lift data
  const getYAxisConfig = (liftData) => {
    // Add null check to prevent errors
    if (
      !liftData ||
      !liftData.datasets ||
      !liftData.datasets[0] ||
      !liftData.datasets[0].data
    ) {
      return {
        max: 100,
        ticks: [0, 50, 100], // Fewer default ticks
      };
    }

    // Find maximum value in the data and round up to nearest 10
    const maxValue = Math.max(...liftData.datasets[0].data);
    const roundedMax = Math.ceil(maxValue / 10) * 10;

    // Determine appropriate interval based on the max value
    let interval = 20; // Default to 20kg intervals
    if (roundedMax > 200) {
      interval = 50; // Use 50kg intervals for larger values
    } else if (roundedMax > 100) {
      interval = 30; // Use 30kg intervals for medium values
    }

    // Create array of ticks with larger intervals
    const ticks = [];
    for (let i = 0; i <= roundedMax; i += interval) {
      ticks.push(i);
    }

    return {
      max: roundedMax,
      ticks: ticks,
    };
  };

  // Common chart configuration with updates
  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 1,
    barPercentage: 0.5,
    useShadowColorFromDataset: true, // Use dataset color for lines
    fillShadowGradientOpacity: 0.2, // Lower opacity for area under curve
    propsForBackgroundLines: {
      strokeDasharray: "5, 5",
      strokeWidth: 1,
      stroke: "rgba(0, 0, 0, 0.1)",
    },
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 30,
    paddingBottom: 10,
    propsForLabels: {
      fontSize: 10,
      fontWeight: "400",
    },
    // Custom function to format y-axis labels with larger intervals
    formatYLabel: (value) => {
      const numValue = Number(value);
      // Determine display interval based on the maximum value
      const maxValue = yAxisConfig?.max || 100;
      let displayInterval = 20; // Default

      if (maxValue > 200) {
        displayInterval = 50;
      } else if (maxValue > 100) {
        displayInterval = 30;
      }

      // Only show labels at the specified intervals
      return numValue % displayInterval === 0 ? `${numValue}` : "";
    },
  };

  const chartStyle = {
    marginVertical: 8,
    borderRadius: 16,
    padding: 10,
    paddingBottom: 30, // Additional padding at the bottom for x-axis labels
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 25,
  };

  const renderChart = (data, title, color, dataKey) => {
    // Add null check before rendering chart
    if (!data) {
      return (
        <View style={styles.singleChartContainer}>
          <Text style={[styles.liftTitle, { color: color }]}>{title}</Text>
          <View style={styles.loadingChartContainer}>
            <ActivityIndicator size="large" color={color} />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        </View>
      );
    }

    // Get y-axis configuration for this specific lift
    const yAxisConfig = getYAxisConfig(data);

    // Update the dataset color to match the title color
    const updatedData = {
      ...data,
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        color: (opacity = 1) =>
          `${color}${Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        // Add fill gradient color (gray) for area under the line
        fillShadowGradient: "#CCCCCC",
      })),
    };

    return (
      <View style={styles.singleChartContainer}>
        <Text style={[styles.liftTitle, { color: color }]}>
          {title}
          {selectedMax?.type === dataKey && selectedMax?.weight && (
            <Text style={styles.selectedDateText}>
              {" "}
              ({selectedMax.weight}kg)
            </Text>
          )}
        </Text>

        <LineChart
          data={updatedData}
          width={chartWidth}
          height={CHART_HEIGHT}
          chartConfig={{
            ...chartConfig,
            // Set colors for dots and lines to match title
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: color,
              fill: color,
            },
            // Adjust label styling to fit more labels
            propsForLabels: {
              fontSize: 8, // Smaller font size for x-axis labels
              fontWeight: "400",
              textAnchor: "middle", // Center align the text
              rotation: -45, // Angle the text to fit more labels
            },
          }}
          bezier
          style={[chartStyle, { backgroundColor: "#fff" }]}
          fromZero={true}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          segments={yAxisConfig.ticks.length - 1}
          yAxisMax={yAxisConfig.max}
          // Rotate labels slightly to fit more of them
          horizontalLabelRotation={45}
          verticalLabelRotation={0}
          yAxisSuffix="kg"
          // Show every week label with W prefix
          formatXLabel={(value) => `W${value}`}
          xLabelsOffset={10}
          withXAxisLabel={true}
          // Add extra bottom padding to make room for the angled labels
          chartConfig={{
            ...chartConfig,
            paddingBottom: 25,
          }}
          decorator={() => {
            return selectedMax?.type === dataKey && selectedMax?.weight ? (
              <View style={styles.selectedDot} />
            ) : null;
          }}
        />
      </View>
    );
  };

  // Show max date modal when a max lift is clicked
  const handleMaxLiftClick = (liftType) => {
    setSelectedMax({
      type: liftType,
      weight: currentMaxes[liftType].weight,
      achievedAt: currentMaxes[liftType].achievedAt,
    });
    setShowMaxDateModal(true);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";

    const date =
      timestamp instanceof Date
        ? timestamp
        : timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Analytics</Text>

      {/* Current Max Lifts Display */}
      <View style={styles.maxLiftsContainer}>
        <TouchableOpacity
          style={[styles.maxLiftCard, { borderColor: colors.squat }]}
          onPress={() => handleMaxLiftClick("squat")}
        >
          <Text style={styles.maxLiftLabel}>Squat</Text>
          <Text style={styles.maxLiftValue}>
            {currentMaxes.squat.weight} kg
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
          onPress={() => handleMaxLiftClick("bench")}
        >
          <Text style={styles.maxLiftLabel}>Bench</Text>
          <Text style={styles.maxLiftValue}>
            {currentMaxes.bench.weight} kg
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
          onPress={() => handleMaxLiftClick("deadlift")}
        >
          <Text style={styles.maxLiftLabel}>Deadlift</Text>
          <Text style={styles.maxLiftValue}>
            {currentMaxes.deadlift.weight} kg
          </Text>
          <Icon
            name="calendar-outline"
            size={12}
            color="#666"
            style={styles.calendarIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Update Max Button */}
      <TouchableOpacity
        style={styles.updateButton}
        onPress={() => setShowUpdateModal(true)}
      >
        <Text style={styles.updateButtonText}>Update Max Lifts</Text>
      </TouchableOpacity>

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

        {/* Ensure data exists before rendering charts */}
        {squatData ? (
          renderChart(squatData, "Squat", colors.squat, "squat")
        ) : (
          <View style={styles.loadingChartContainer}>
            <ActivityIndicator size="large" color={colors.squat} />
          </View>
        )}

        {benchData ? (
          renderChart(benchData, "Bench Press", colors.benchPress, "bench")
        ) : (
          <View style={styles.loadingChartContainer}>
            <ActivityIndicator size="large" color={colors.benchPress} />
          </View>
        )}

        {deadliftData ? (
          renderChart(deadliftData, "Deadlift", colors.deadlift, "deadlift")
        ) : (
          <View style={styles.loadingChartContainer}>
            <ActivityIndicator size="large" color={colors.deadlift} />
          </View>
        )}

        {/* Touch area to clear tooltip when tapping elsewhere */}
        <TouchableOpacity
          style={styles.clearTooltipArea}
          activeOpacity={1}
          onPress={() => setTooltipData(null)}
        />
      </ScrollView>

      {/* Max Date Modal */}
      <Modal
        visible={showMaxDateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMaxDateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaxDateModal(false)}
        >
          <View style={styles.maxDateContainer}>
            <Text style={styles.maxDateTitle}>
              {selectedMax?.type?.charAt(0).toUpperCase() +
                selectedMax?.type?.slice(1)}{" "}
              Max
            </Text>
            <Text style={styles.maxDateWeight}>{selectedMax?.weight} kg</Text>
            <Text style={styles.maxDateLabel}>Achieved on:</Text>
            <Text style={styles.maxDateValue}>
              {selectedMax?.achievedAt
                ? formatTimestamp(selectedMax.achievedAt)
                : "N/A"}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMaxDateModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Year Dropdown Modal */}
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

      {/* Update Max Lifts Modal */}
      <Modal
        visible={showUpdateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.updateModalContainer}>
            <Text style={styles.updateModalTitle}>Update Max Lifts</Text>
            <Text style={styles.updateModalSubtitle}>
              Enter values only for the lifts you want to update
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Squat (kg)</Text>
              <TextInput
                style={styles.input}
                value={newSquatMax}
                onChangeText={setNewSquatMax}
                keyboardType="numeric"
                placeholder="Enter your squat max"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bench Press (kg)</Text>
              <TextInput
                style={styles.input}
                value={newBenchMax}
                onChangeText={setNewBenchMax}
                keyboardType="numeric"
                placeholder="Enter your bench max"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Deadlift (kg)</Text>
              <TextInput
                style={styles.input}
                value={newDeadliftMax}
                onChangeText={setNewDeadliftMax}
                keyboardType="numeric"
                placeholder="Enter your deadlift max"
              />
            </View>

            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowUpdateModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateMaxes}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    marginBottom: 10,
  },
  updateButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginBottom: 20,
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  singleChartContainer: {
    marginBottom: 30,
    width: "100%",
    // Increase padding to ensure content stays within bounds
    paddingHorizontal: 5,
    paddingTop: 10, // Add top padding
    paddingBottom: 15, // Add bottom padding
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  loadingContainer: {
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  noDataContainer: {
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
  },
  noDataText: {
    color: "#666",
    fontSize: 14,
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
  yAxisValueContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 75, // Increased width to match new left padding
    paddingRight: 15, // Increased right padding to move values away from the chart
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
    right: 15, // Increased right position to move values further from the chart
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
  updateModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  updateModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  updateModalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#000",
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  saveButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
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
  maxDateContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "70%",
    maxWidth: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  maxDateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  maxDateWeight: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  maxDateLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  maxDateValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "black",
  },
  selectedDateText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  loadingChartContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 30,
  },
});

export default AthleteStats;
