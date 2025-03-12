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
  RefreshControl,
  TouchableWithoutFeedback,
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
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define chart dimensions outside component so they're accessible to styles
const chartWidth = Dimensions.get("window").width - 85;
const CHART_HEIGHT = 200; // Constant for chart height used in styles

const AthleteStats = () => {
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // State for progression data
  const [squatData, setSquatData] = useState(null);
  const [benchData, setBenchData] = useState(null);
  const [deadliftData, setDeadliftData] = useState(null);
  const [currentMaxes, setCurrentMaxes] = useState({
    squat: { weight: 0, achievedAt: null },
    bench: { weight: 0, achievedAt: null },
    deadlift: { weight: 0, achievedAt: null },
  });

  // Add state for demo data
  const [isDemoData, setIsDemoData] = useState(false);
  const [demoProgressionData, setDemoProgressionData] = useState(null);

  // State for update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newSquatMax, setNewSquatMax] = useState("");
  const [newBenchMax, setNewBenchMax] = useState("");
  const [newDeadliftMax, setNewDeadliftMax] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // State for showing max date modal
  const [showMaxDateModal, setShowMaxDateModal] = useState(false);
  const [selectedMax, setSelectedMax] = useState(null);

  // Get current year and create array of last 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const availableYears = years; // Define availableYears as the same as years
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

  const loadUserData = async (yearToLoad = selectedYear) => {
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

          // Store the original progression data for year changes
          if (!isDemoData) {
            setDemoProgressionData({
              squatProgression: analyticsData.squatProgression || [],
              benchProgression: analyticsData.benchProgression || [],
              deadliftProgression: analyticsData.deadliftProgression || [],
            });
          }

          // Calculate year maxes for the selected year
          if (
            analyticsData.squatProgression ||
            analyticsData.benchProgression ||
            analyticsData.deadliftProgression
          ) {
            const yearMaxes = calculateYearMaxes(
              analyticsData.squatProgression || [],
              analyticsData.benchProgression || [],
              analyticsData.deadliftProgression || [],
              yearToLoad
            );

            setCurrentMaxes(yearMaxes);

            // Update input fields with current maxes
            if (yearMaxes.squat.weight) {
              setNewSquatMax(yearMaxes.squat.weight.toString());
            }
            if (yearMaxes.bench.weight) {
              setNewBenchMax(yearMaxes.bench.weight.toString());
            }
            if (yearMaxes.deadlift.weight) {
              setNewDeadliftMax(yearMaxes.deadlift.weight.toString());
            }
          } else if (analyticsData.currentMaxes) {
            // If no progression data but we have current maxes, use those
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

            // Update input fields with current maxes
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

          // Process squat data
          if (
            analyticsData.squatProgression &&
            analyticsData.squatProgression.length > 0
          ) {
            const formattedSquatData = processProgressionData(
              analyticsData.squatProgression,
              yearToLoad
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
              analyticsData.benchProgression,
              yearToLoad
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
              analyticsData.deadliftProgression,
              yearToLoad
            );
            setDeadliftData(formattedDeadliftData);
          } else {
            setDeadliftData(createEmptyDataset());
          }
        } else {
          // No analytics data, set empty datasets
          setSquatData(createEmptyDataset());
          setBenchData(createEmptyDataset());
          setDeadliftData(createEmptyDataset());

          // Set empty maxes
          setCurrentMaxes({
            squat: { weight: 0, achievedAt: null },
            bench: { weight: 0, achievedAt: null },
            deadlift: { weight: 0, achievedAt: null },
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Set empty datasets on error
      setSquatData(createEmptyDataset());
      setBenchData(createEmptyDataset());
      setDeadliftData(createEmptyDataset());

      // Set empty maxes
      setCurrentMaxes({
        squat: { weight: 0, achievedAt: null },
        bench: { weight: 0, achievedAt: null },
        deadlift: { weight: 0, achievedAt: null },
      });
    } finally {
      setIsLoading(false);
      setIsDemoData(false); // Ensure we're not in demo mode when loading real data
      saveDemoDataState(false); // Save the real data state to AsyncStorage
    }
  };

  // Save selected year to AsyncStorage
  const saveSelectedYear = async (year) => {
    try {
      await AsyncStorage.setItem("selectedYear", year);
      console.log(`[DEBUG] Saved selected year to storage: ${year}`);
    } catch (error) {
      console.error("Error saving selected year:", error);
    }
  };

  // Load selected year from AsyncStorage
  const loadSelectedYear = async () => {
    try {
      const savedYear = await AsyncStorage.getItem("selectedYear");
      if (savedYear) {
        console.log(`[DEBUG] Loaded selected year from storage: ${savedYear}`);
        setSelectedYear(savedYear);
        return savedYear;
      }
      return null;
    } catch (error) {
      console.error("Error loading selected year:", error);
      return null;
    }
  };

  // Save demo data state to AsyncStorage
  const saveDemoDataState = async (isDemoMode) => {
    try {
      await AsyncStorage.setItem("isDemoData", isDemoMode.toString());
      console.log(`[DEBUG] Saved demo data state: ${isDemoMode}`);
    } catch (error) {
      console.error("Error saving demo data state:", error);
    }
  };

  // Load demo data state from AsyncStorage
  const loadDemoDataState = async () => {
    try {
      const savedState = await AsyncStorage.getItem("isDemoData");
      if (savedState) {
        const isDemoMode = savedState === "true";
        console.log(`[DEBUG] Loaded demo data state: ${isDemoMode}`);
        setIsDemoData(isDemoMode);
        return isDemoMode;
      }
      return false;
    } catch (error) {
      console.error("Error loading demo data state:", error);
      return false;
    }
  };

  // Load user data with the saved year on initial mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      const savedYear = await loadSelectedYear();
      const isDemoMode = await loadDemoDataState();

      if (isDemoMode) {
        // If we were in demo mode, regenerate the demo data
        generateDemoData(false); // Pass false to avoid saving state again
      } else {
        await loadUserData(savedYear || selectedYear);
      }
    };

    initializeData();
  }, []);

  // Add a useEffect to reload data when the selected year changes
  useEffect(() => {
    console.log(`[DEBUG] Year changed in useEffect: ${selectedYear}`);
    // Only reload if we're not in the initial loading state
    if (!isLoading) {
      // Save the selected year to AsyncStorage
      saveSelectedYear(selectedYear);

      if (isDemoData && demoProgressionData) {
        // For demo data, recalculate with the new year
        const yearMaxes = calculateYearMaxes(
          demoProgressionData.squatProgression,
          demoProgressionData.benchProgression,
          demoProgressionData.deadliftProgression,
          selectedYear
        );

        // Process data for charts
        const processedSquatData = processProgressionData(
          demoProgressionData.squatProgression,
          selectedYear
        );
        const processedBenchData = processProgressionData(
          demoProgressionData.benchProgression,
          selectedYear
        );
        const processedDeadliftData = processProgressionData(
          demoProgressionData.deadliftProgression,
          selectedYear
        );

        // Update chart data
        setSquatData(processedSquatData);
        setBenchData(processedBenchData);
        setDeadliftData(processedDeadliftData);
        setCurrentMaxes(yearMaxes);

        // Update input fields with current maxes
        if (yearMaxes.squat.weight) {
          setNewSquatMax(yearMaxes.squat.weight.toString());
        }
        if (yearMaxes.bench.weight) {
          setNewBenchMax(yearMaxes.bench.weight.toString());
        }
        if (yearMaxes.deadlift.weight) {
          setNewDeadliftMax(yearMaxes.deadlift.weight.toString());
        }
      } else {
        // For real data, reload from Firebase with the selected year
        loadUserData(selectedYear);
      }
    }
  }, [selectedYear]);

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
  const processProgressionData = (progressionArray, explicitYear = null) => {
    if (!progressionArray || progressionArray.length === 0) {
      return createEmptyDataset();
    }

    // Use explicitly provided year or fall back to selectedYear state
    const yearToUse = explicitYear || selectedYear;
    console.log(`[DEBUG] Processing data for year: ${yearToUse}`);

    // Filter for selected year and sort progression by date
    const yearData = progressionArray.filter((entry) => {
      const entryDate =
        entry.date instanceof Date ? entry.date : entry.date.toDate();
      return entryDate.getFullYear().toString() === yearToUse;
    });

    console.log(
      `[DEBUG] Found ${yearData.length} entries for year ${yearToUse}`
    );

    if (yearData.length === 0) {
      return createEmptyDataset();
    }

    // Sort by date (oldest to newest)
    const sortedProgression = [...yearData].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : a.date.toDate();
      const dateB = b.date instanceof Date ? b.date : b.date.toDate();
      return dateA - dateB;
    });

    // Process monthly data
    return processMonthlyData(sortedProgression);
  };

  // Process monthly data for charts
  const processMonthlyData = (sortedProgression, maxWeight = null) => {
    // Create arrays for chart data
    const monthLabels = [];
    const weightData = [];
    const dateStrings = [];
    const isPRMonth = [];

    // Initialize arrays with all 12 months
    for (let i = 0; i < 12; i++) {
      monthLabels.push(monthNames[i].substring(0, 3)); // Use first 3 letters of month name
      weightData.push(null); // Initialize with null (no data point)
      dateStrings.push(""); // Empty date string
      isPRMonth.push(false); // Not a PR month by default
    }

    // Process each entry
    sortedProgression.forEach((entry) => {
      const entryDate =
        entry.date instanceof Date ? entry.date : entry.date.toDate();
      const month = entryDate.getMonth();

      // Update the data for this month if the weight is higher than what's already there
      // or if there's no data yet
      if (weightData[month] === null || entry.weight > weightData[month]) {
        weightData[month] = entry.weight;
        dateStrings[month] = entryDate.toISOString().split("T")[0];
        isPRMonth[month] = true; // This is a PR month
      }
    });

    // If maxWeight is provided, use it to scale the chart
    const validWeights = weightData.filter((w) => w !== null);
    const maxDataWeight =
      maxWeight || (validWeights.length > 0 ? Math.max(...validWeights) : 1);

    return {
      labels: monthLabels,
      datasets: [
        {
          data: weightData,
          strokeWidth: 3,
        },
      ],
      dates: dateStrings,
      isPRMonth: isPRMonth,
      scale: "monthly",
      maxValue: maxDataWeight,
    };
  };

  // Create empty dataset for when no data is available
  const createEmptyDataset = () => {
    // Create arrays with all 12 months
    const monthLabels = monthNames.map((month) => month.substring(0, 3));
    const emptyData = Array(12).fill(null);
    const emptyDates = Array(12).fill("");
    const emptyPRFlags = Array(12).fill(false);
    const noActualData = Array(12).fill(false);

    return {
      labels: monthLabels,
      datasets: [
        {
          data: emptyData,
          strokeWidth: 3,
        },
      ],
      dates: emptyDates,
      isPRMonth: emptyPRFlags,
      scale: "monthly",
      isEmpty: true, // Add a flag to explicitly mark this as an empty dataset
      hasActualData: noActualData,
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

  // Update year selection to handle demo data
  const handleYearSelect = (year) => {
    console.log(`[DEBUG] Year selected: ${year}`);
    setSelectedYear(year);
    setShowYearDropdown(false);
    // Save the selected year to AsyncStorage
    saveSelectedYear(year);
    // The useEffect hook will handle loading the data for the selected year
  };

  // Handle dot press to show max lift details
  const handleDotPress = (data, dataPointIndex, liftType, x, y) => {
    if (
      !data ||
      !data.datasets ||
      !data.datasets[0] ||
      !data.datasets[0].data
    ) {
      return;
    }

    const weight = data.datasets[0].data[dataPointIndex];
    const date = data.dates[dataPointIndex];
    const month = data.labels[dataPointIndex];

    // Set selected max for modal display
    setSelectedMax({
      type: liftType,
      weight: weight,
      achievedAt: new Date(date),
    });

    // Show the modal
    setShowMaxDateModal(true);
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

    const data = liftData.datasets[0].data;
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data.filter((val) => val > 0));

    // Round up max to the next 50
    const roundedMax = Math.ceil(maxValue / 50) * 50;

    // Round down min to the previous 50 or 75% of min value, whichever is lower
    // This creates some space below the lowest data point
    const calculatedMin = Math.max(0, Math.floor((minValue * 0.75) / 50) * 50);

    // Create ticks array with 50kg intervals
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
    paddingBottom: 25,
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

  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [showDataPointModal, setShowDataPointModal] = useState(false);

  const renderChart = (data, title, color, dataKey) => {
    if (!data) {
      return (
        <View style={styles.singleChartContainer}>
          <Text style={styles.chartTitle}>{title}</Text>
          <View style={styles.loadingChartContainer}>
            <ActivityIndicator size="large" color={color} />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        </View>
      );
    }

    // Get y-axis configuration for this specific lift
    const yAxisConfig = getYAxisConfig(data);

    // Check if there's any data for this year
    // Consider it empty if all values are 0 or if the dataset is explicitly marked as empty
    const hasData =
      data.datasets[0].data.some((value) => value > 0) && !data.isEmpty;

    if (!hasData) {
      // Mark this dataset as empty but don't render anything
      // The parent component will handle showing a single "No data" message
      data.isEmpty = true;
      return null;
    }

    // Filter out null values from the dataset
    // We'll create a new dataset with only the months that have data
    const filteredData = {
      labels: [],
      datasets: [{ data: [] }],
      dates: [],
      isPRMonth: [],
    };

    // Only include months that have actual data (non-null values)
    data.datasets[0].data.forEach((value, index) => {
      if (value !== null && value !== 0) {
        filteredData.labels.push(data.labels[index]);
        filteredData.datasets[0].data.push(value);
        filteredData.dates.push(data.dates[index]);
        filteredData.isPRMonth.push(data.isPRMonth[index]);
      }
    });

    // If after filtering we have no data points, return null
    if (filteredData.datasets[0].data.length === 0) {
      data.isEmpty = true;
      return null;
    }

    // Update the dataset color to match the title color
    const chartData = {
      labels: filteredData.labels,
      datasets: [
        {
          data: filteredData.datasets[0].data,
          color: (opacity = 1) =>
            color +
            Math.round(opacity * 255)
              .toString(16)
              .padStart(2, "0"),
          strokeWidth: 3,
        },
      ],
      dates: filteredData.dates,
      isPRMonth: filteredData.isPRMonth,
      scale: "monthly",
    };

    return (
      <View style={styles.singleChartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{title}</Text>
        </View>

        <LineChart
          data={{
            labels: chartData.labels,
            datasets: chartData.datasets,
          }}
          width={Dimensions.get("window").width - 100}
          height={180}
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
            paddingLeft: 5,
            paddingRight: 10,
            paddingTop: 20,
            paddingBottom: 20,
            propsForLabels: {
              fontSize: 8,
              fontWeight: "400",
            },
          }}
          onDataPointClick={({ index }) => {
            // Only allow click on actual PR months
            if (chartData.isPRMonth[index]) {
              const weight = chartData.datasets[0].data[index];
              const date = chartData.dates[index];
              const month = chartData.labels[index];

              // Set selected max for modal display
              setSelectedMax({
                type: dataKey,
                weight: weight,
                achievedAt: new Date(date),
              });

              // Show the modal
              setShowMaxDateModal(true);
            }
          }}
          bezier={false} // Use straight lines instead of bezier curves
          withDots={true} // Show dots for each data point
          fromZero={false} // Don't start y-axis from zero
          style={{
            marginVertical: 8,
            borderRadius: 16,
            padding: 0,
            paddingBottom: 20,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#f0f0f0",
            marginBottom: 15,
            marginLeft: -5,
          }}
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={true}
          withHorizontalLines={true}
          withShadow={false}
          segments={4}
          yAxisInterval={1}
          yAxisMax={yAxisConfig.max}
          yAxisMin={yAxisConfig.min}
          yAxisSuffix="kg"
          formatXLabel={(value) => `${value}`}
          // Use decorator instead of renderDotContent
          decorator={({ x, y, index, value }) => {
            // Only render dots for PR months
            if (!chartData.isPRMonth[index]) return null;

            return (
              <View
                key={index}
                style={{
                  position: "absolute",
                  left: x - 4,
                  top: y - 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: color,
                }}
              />
            );
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

  // Calculate the max weights for the selected year only
  const calculateYearMaxes = (squatData, benchData, deadliftData, year) => {
    const getYearMax = (progressionData) => {
      if (!progressionData || progressionData.length === 0) {
        return { weight: 0, achievedAt: null };
      }

      // Filter for the selected year
      const yearData = progressionData.filter((entry) => {
        const entryDate =
          entry.date instanceof Date ? entry.date : entry.date.toDate();
        return entryDate.getFullYear().toString() === year;
      });

      if (yearData.length === 0) {
        return { weight: 0, achievedAt: null };
      }

      // Find the max weight for this year
      let maxWeight = 0;
      yearData.forEach((entry) => {
        maxWeight = Math.max(maxWeight, entry.weight);
      });

      // Find the latest date with this max weight
      let latestDate = null;
      yearData.forEach((entry) => {
        if (entry.weight === maxWeight) {
          const entryDate =
            entry.date instanceof Date ? entry.date : entry.date.toDate();
          if (!latestDate || entryDate > latestDate) {
            latestDate = entryDate;
          }
        }
      });

      return {
        weight: maxWeight,
        achievedAt: latestDate,
      };
    };

    return {
      squat: getYearMax(squatData),
      bench: getYearMax(benchData),
      deadlift: getYearMax(deadliftData),
    };
  };

  // Generate demo data function
  const generateDemoData = (shouldSaveState = true) => {
    setIsLoading(true);

    // Use fixed years starting from 2021 instead of relative years
    const startYear = 2021;
    const endYear = 2025;

    // Create mock user data to match coach's implementation
    const mockUser = {
      firstName: "Demo",
      lastName: "User",
      profileColor: "#A8E6CF",
    };

    // Generate 5 years of progression data with more realistic patterns and few missing months
    const generateProgression = (startWeight, yearlyIncrease, liftType) => {
      const progression = [];

      // Maximum weights to cap progression
      const maxWeights = {
        squat: 250, // Match coach's implementation
        bench: 140, // Match coach's implementation
        deadlift: 270, // Match coach's implementation
      };

      // Define the final weight for each year
      const yearEndWeights = {};
      for (let yearOffset = 0; yearOffset < 5; yearOffset++) {
        const year = (startYear + yearOffset).toString();
        // Year end weight increases by the yearly increase amount, with more modest effect
        const dramaticIncrease = yearlyIncrease * (1.2 + yearOffset * 0.15); // More realistic increases each year

        // Calculate how much to add this year
        let calculatedWeight = Math.round(
          startWeight + dramaticIncrease * yearOffset
        );

        // Cap the weight at the maximum for each lift type
        if (calculatedWeight > maxWeights[liftType]) {
          calculatedWeight = maxWeights[liftType];
        }

        yearEndWeights[year] = calculatedWeight;
      }

      // Track the all-time best to avoid regressions
      let allTimeBest = startWeight - 5;

      // Track the highest weight achieved in each year
      const yearHighestWeights = {};

      // Create unique progression patterns for each lift in each year
      const createProgressPattern = (year, liftType) => {
        const yearIndex = year - startYear;

        // Months in each year we'll skip (no PRs)
        // Only skip 2-3 months per year for more continuous data
        const monthsToSkip = new Set();

        // Different lifts skip different months
        switch (liftType) {
          case "squat":
            // Squat: Skip a couple months based on year
            if (year === 2021) {
              monthsToSkip.add(3); // Skip April
              monthsToSkip.add(7); // Skip August
            } else if (year === 2022) {
              monthsToSkip.add(1); // Skip February
              monthsToSkip.add(9); // Skip October
            } else if (year === 2023) {
              monthsToSkip.add(2); // Skip March
              monthsToSkip.add(8); // Skip September
            } else if (year === 2024) {
              monthsToSkip.add(4); // Skip May
              monthsToSkip.add(10); // Skip November
            } else {
              monthsToSkip.add(5); // Skip June
              monthsToSkip.add(11); // Skip December
            }
            break;

          case "bench":
            // Bench: Skip different months
            if (year === 2021) {
              monthsToSkip.add(2); // Skip March
              monthsToSkip.add(9); // Skip October
            } else if (year === 2022) {
              monthsToSkip.add(4); // Skip May
              monthsToSkip.add(11); // Skip December
            } else if (year === 2023) {
              monthsToSkip.add(1); // Skip February
              monthsToSkip.add(6); // Skip July
            } else if (year === 2024) {
              monthsToSkip.add(3); // Skip April
              monthsToSkip.add(8); // Skip September
            } else {
              monthsToSkip.add(0); // Skip January
              monthsToSkip.add(7); // Skip August
            }
            break;

          case "deadlift":
            // Deadlift: Skip different months
            if (year === 2021) {
              monthsToSkip.add(1); // Skip February
              monthsToSkip.add(8); // Skip September
            } else if (year === 2022) {
              monthsToSkip.add(3); // Skip April
              monthsToSkip.add(10); // Skip November
            } else if (year === 2023) {
              monthsToSkip.add(5); // Skip June
              monthsToSkip.add(9); // Skip October
            } else if (year === 2024) {
              monthsToSkip.add(0); // Skip January
              monthsToSkip.add(7); // Skip August
            } else {
              monthsToSkip.add(2); // Skip March
              monthsToSkip.add(6); // Skip July
            }
            break;
        }

        // Generate months with PRs (all months except those we skip)
        const progressMonths = [];
        for (let month = 0; month < 12; month++) {
          if (!monthsToSkip.has(month)) {
            progressMonths.push(month);
          }
        }

        return {
          months: progressMonths.sort((a, b) => a - b),
          monthsToSkip: Array.from(monthsToSkip),
        };
      };

      for (let year = startYear; year <= endYear; year++) {
        const yearIndex = year - startYear;
        const baseWeight = startWeight + yearIndex * yearlyIncrease * 1.2; // More realistic base increases
        const yearString = year.toString();

        // Get unique progression pattern for this lift and year
        const progressPattern = createProgressPattern(year, liftType);
        const sortedProgressMonths = progressPattern.months;

        // Calculate the weight jumps
        // Make jumps more dramatic with bigger increases
        const totalProgressNeeded = yearEndWeights[yearString] - allTimeBest;
        const prMonthCount = sortedProgressMonths.length;

        // Big average jump for dramatic effect
        const averageJumpPerProgressMonth = Math.max(
          2, // Minimum 2kg jumps
          Math.round((totalProgressNeeded / prMonthCount) * 1.2) // Increase by 20%
        );

        // Only create entries for months with PRs
        let currentYearBest = allTimeBest;

        // Initialize the highest weight for this year
        yearHighestWeights[yearString] = currentYearBest;

        // Add plateaus - determine how many months will plateau
        const plateauCount = Math.floor(sortedProgressMonths.length * 0.4); // About 40% of months will plateau
        const plateauMonths = new Set();

        // Randomly select months to plateau (except first and last month)
        for (
          let i = 0;
          i < plateauCount && sortedProgressMonths.length > 3;
          i++
        ) {
          // Skip first and last month for plateaus
          const randomIndex =
            1 + Math.floor(Math.random() * (sortedProgressMonths.length - 2));
          plateauMonths.add(randomIndex);
        }

        // Track the months we actually log PRs for
        for (
          let monthIndex = 0;
          monthIndex < sortedProgressMonths.length;
          monthIndex++
        ) {
          const month = sortedProgressMonths[monthIndex];

          // Add realistic variability in jumps
          let jumpMultiplier = 1.0;

          // Check if this month should plateau (no increase)
          if (plateauMonths.has(monthIndex)) {
            jumpMultiplier = 0; // No increase for plateau months
          }
          // First PR of the year is bigger
          else if (monthIndex === 0) {
            jumpMultiplier = 1.5; // 50% bigger jump to start the year
          }
          // Last PR of the year is also bigger
          else if (monthIndex === sortedProgressMonths.length - 1) {
            // For the last month, calculate exactly what's needed to reach the year-end target
            const remainingProgress =
              yearEndWeights[yearString] - currentYearBest;
            if (remainingProgress > 0) {
              // Set a specific increase to hit the target exactly
              const increase = remainingProgress;
              currentYearBest += increase;

              // Skip the rest of the loop since we've already updated currentYearBest
              const date = new Date(
                year,
                month,
                10 + Math.floor(Math.random() * 15)
              );

              // Double check the date is in the correct year
              if (date.getFullYear() !== year) {
                date.setFullYear(year);
              }

              progression.push({
                weight: currentYearBest,
                date,
              });

              // Update the highest weight achieved this year
              yearHighestWeights[yearString] = Math.max(
                yearHighestWeights[yearString],
                currentYearBest
              );

              continue; // Skip to the next month
            } else {
              jumpMultiplier = 0; // Plateau if we're already at or above the target
            }
          }
          // Special big jumps occasionally (15% chance)
          else if (Math.random() < 0.15) {
            jumpMultiplier = 1.8; // 1.8x sized breakthrough
          }
          // Add more plateaus (25% chance)
          else if (Math.random() < 0.25) {
            jumpMultiplier = 0; // No increase for random plateaus
          }
          // Middle PRs are variable
          else {
            // Add more randomness with realistic average
            jumpMultiplier = 0.8 + Math.random() * 0.7; // 0.8-1.5x
          }

          // Customize PR jumps by lift type
          switch (liftType) {
            case "squat":
              // Squat tends to have bigger jumps
              jumpMultiplier *= 1.2;
              break;
            case "bench":
              // Bench has smaller but more consistent jumps
              jumpMultiplier *= 0.9;
              break;
            case "deadlift":
              // Deadlift has the biggest jumps
              jumpMultiplier *= 1.3;
              break;
          }

          // Apply dramatic jumps
          const increase = Math.round(
            averageJumpPerProgressMonth * jumpMultiplier
          );

          // Ensure we never decrease - either increase or plateau
          if (increase > 0) {
            currentYearBest += increase;
          }

          // Make sure we don't exceed the year-end target too early
          if (
            month < 9 &&
            currentYearBest >= yearEndWeights[yearString] &&
            monthIndex < sortedProgressMonths.length - 1
          ) {
            currentYearBest = Math.max(
              yearEndWeights[yearString] - Math.ceil(Math.random() * 10),
              currentYearBest // Ensure we don't go below current best
            );
          }

          // Ensure we hit the year-end target exactly with the last PR of the year
          if (monthIndex === sortedProgressMonths.length - 1) {
            currentYearBest = yearEndWeights[yearString];
          }

          // Update the highest weight achieved this year
          yearHighestWeights[yearString] = Math.max(
            yearHighestWeights[yearString],
            currentYearBest
          );

          // Only log entry on PR months
          // Create a date for this month (different day each time for realism)
          const date = new Date(
            year,
            month,
            10 + Math.floor(Math.random() * 15)
          );

          // Double check the date is in the correct year
          if (date.getFullYear() !== year) {
            // Correct the year if needed
            date.setFullYear(year);
          }

          progression.push({
            weight: currentYearBest,
            date,
          });
        }

        // Ensure the year-end weight matches the highest weight achieved
        yearEndWeights[yearString] = yearHighestWeights[yearString];

        // Update the all-time best after each year
        // This ensures the next year starts at least at the highest weight achieved this year
        allTimeBest = yearHighestWeights[yearString];
      }

      return progression;
    };

    // Generate mock progression data with 2021 starting weights and more realistic patterns
    // Use the exact same starting weights and yearly increases as in ClientsStats.js
    const squatProgression = generateProgression(50, 15, "squat"); // Start: 50kg in 2021, +15kg/year
    const benchProgression = generateProgression(30, 9, "bench"); // Start: 30kg in 2021, +9kg/year
    const deadliftProgression = generateProgression(60, 18, "deadlift"); // Start: 60kg in 2021, +18kg/year

    // Calculate year maxes
    const yearMaxes = calculateYearMaxes(
      squatProgression,
      benchProgression,
      deadliftProgression,
      selectedYear
    );

    // Process data for charts
    const processedSquatData = processProgressionData(
      squatProgression,
      selectedYear
    );
    const processedBenchData = processProgressionData(
      benchProgression,
      selectedYear
    );
    const processedDeadliftData = processProgressionData(
      deadliftProgression,
      selectedYear
    );

    // Update state with demo data
    setUserData(mockUser);
    setSquatData(processedSquatData);
    setBenchData(processedBenchData);
    setDeadliftData(processedDeadliftData);
    setCurrentMaxes(yearMaxes);

    // Store the original progression data for year changes
    setDemoProgressionData({
      squatProgression,
      benchProgression,
      deadliftProgression,
    });

    // Update input fields with current maxes
    setNewSquatMax(yearMaxes.squat.weight.toString());
    setNewBenchMax(yearMaxes.bench.weight.toString());
    setNewDeadliftMax(yearMaxes.deadlift.weight.toString());

    // Set demo data flag
    setIsDemoData(true);
    setIsLoading(false);

    // If the selected year is outside our range, select the first year
    if (
      parseInt(selectedYear) < startYear ||
      parseInt(selectedYear) > endYear
    ) {
      handleYearSelect(startYear.toString());
    }

    // Save demo data state to AsyncStorage if requested
    if (shouldSaveState) {
      saveDemoDataState(true);
    }
  };

  // Refresh function
  const onRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    console.log(`[DEBUG] Refreshing data for year: ${selectedYear}`);

    if (isDemoData && demoProgressionData) {
      // For demo data, recalculate with the current year
      const yearMaxes = calculateYearMaxes(
        demoProgressionData.squatProgression,
        demoProgressionData.benchProgression,
        demoProgressionData.deadliftProgression,
        selectedYear
      );

      // Process data for charts
      const processedSquatData = processProgressionData(
        demoProgressionData.squatProgression,
        selectedYear
      );
      const processedBenchData = processProgressionData(
        demoProgressionData.benchProgression,
        selectedYear
      );
      const processedDeadliftData = processProgressionData(
        demoProgressionData.deadliftProgression,
        selectedYear
      );

      // Update chart data
      setSquatData(processedSquatData);
      setBenchData(processedBenchData);
      setDeadliftData(processedDeadliftData);
      setCurrentMaxes(yearMaxes);
    } else {
      // For real data, reload from Firebase with the selected year
      await loadUserData(selectedYear);
    }

    setIsRefreshing(false);
  }, [selectedYear, isDemoData, demoProgressionData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Analytics</Text>

      <TouchableOpacity
        style={styles.testButton}
        onPress={() => generateDemoData(true)}
      >
        <Text style={styles.testButtonText}>Load Demo Data</Text>
      </TouchableOpacity>

      {isDemoData && (
        <TouchableOpacity
          style={[styles.testButton, { marginTop: 10 }]}
          onPress={async () => {
            setIsDemoData(false);
            await saveDemoDataState(false);
            await loadUserData();
          }}
        >
          <Text style={styles.testButtonText}>Return to My Data</Text>
        </TouchableOpacity>
      )}

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
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
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
            <Icon name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Year dropdown modal */}
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
            <View style={styles.yearDropdownContainer}>
              <View style={styles.yearDropdown}>
                {availableYears.map((year) => (
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
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Chart content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <>
            {/* Check if there's any data for the selected year */}
            {(!squatData ||
              squatData.isEmpty ||
              (squatData.datasets[0].data.length === 1 &&
                squatData.datasets[0].data[0] === 0)) &&
            (!benchData ||
              benchData.isEmpty ||
              (benchData.datasets[0].data.length === 1 &&
                benchData.datasets[0].data[0] === 0)) &&
            (!deadliftData ||
              deadliftData.isEmpty ||
              (deadliftData.datasets[0].data.length === 1 &&
                deadliftData.datasets[0].data[0] === 0)) ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  No lift data available for {selectedYear}
                </Text>
                <Text
                  style={[
                    styles.noDataText,
                    { fontSize: 14, marginTop: 10, fontWeight: "400" },
                  ]}
                >
                  Try selecting a different year or add new lifts
                </Text>
              </View>
            ) : (
              <>
                {squatData ? (
                  renderChart(squatData, "Squat", colors.squat, "squat")
                ) : (
                  <View style={styles.loadingChartContainer}>
                    <ActivityIndicator size="large" color={colors.squat} />
                  </View>
                )}

                {benchData ? (
                  renderChart(
                    benchData,
                    "Bench Press",
                    colors.benchPress,
                    "bench"
                  )
                ) : (
                  <View style={styles.loadingChartContainer}>
                    <ActivityIndicator size="large" color={colors.benchPress} />
                  </View>
                )}

                {deadliftData ? (
                  renderChart(
                    deadliftData,
                    "Deadlift",
                    colors.deadlift,
                    "deadlift"
                  )
                ) : (
                  <View style={styles.loadingChartContainer}>
                    <ActivityIndicator size="large" color={colors.deadlift} />
                  </View>
                )}
              </>
            )}
          </>
        )}
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
            {selectedMax && (
              <>
                <Text
                  style={[
                    styles.maxDateTitle,
                    {
                      color:
                        selectedMax.type === "squat"
                          ? colors.squat
                          : selectedMax.type === "bench"
                          ? colors.benchPress
                          : colors.deadlift,
                    },
                  ]}
                >
                  {selectedMax.type === "squat"
                    ? "Squat"
                    : selectedMax.type === "bench"
                    ? "Bench Press"
                    : "Deadlift"}{" "}
                  Max
                </Text>
                <Text style={styles.maxDateWeight}>
                  {selectedMax.weight} kg
                </Text>
                <Text style={styles.maxDateLabel}>Achieved on</Text>
                <Text style={styles.maxDateValue}>
                  {selectedMax.achievedAt
                    ? formatTimestamp(selectedMax.achievedAt)
                    : "Unknown date"}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMaxDateModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Update Max Lifts Modal */}
      <Modal
        visible={showUpdateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpdateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUpdateModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View style={styles.updateModalContainer}>
              <Text style={styles.updateModalTitle}>Update Max Lifts</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Squat (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newSquatMax}
                  onChangeText={setNewSquatMax}
                  placeholder="Enter squat max"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bench Press (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newBenchMax}
                  onChangeText={setNewBenchMax}
                  placeholder="Enter bench max"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Deadlift (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={newDeadliftMax}
                  onChangeText={setNewDeadliftMax}
                  placeholder="Enter deadlift max"
                />
              </View>

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowUpdateModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateMaxes}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
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
    width: Dimensions.get("window").width - 32,
    marginRight: 100,
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  noDataContainer: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginVertical: 40,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    width: "90%",
    alignSelf: "center",
  },
  noDataText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
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
    fontWeight: "600",
    color: "#333",
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
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 5,
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
    paddingVertical: 15,
    paddingHorizontal: 15,
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
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
  },
  testButton: {
    marginBottom: 20,
    alignSelf: "flex-end",
    paddingHorizontal: 0,
  },
  testButtonText: {
    color: "#666",
    fontSize: 12,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  yearDropdownContainer: {
    position: "absolute",
    top: 150,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 0,
    width: 120,
    maxHeight: 300,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  yearDropdown: {
    // Add your year options here
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default AthleteStats;
