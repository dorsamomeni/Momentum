import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";
import { auth, db } from "../src/config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Animated from "react-native/Libraries/Animated/Animated";

const ClientsStats = ({ route }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeScale, setTimeScale] = useState("monthly"); // Always use monthly view
  const [zoomRange, setZoomRange] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Move the ref to the top level - don't declare hooks inside render functions
  const panRef = useRef(null);

  // Create helper functions using useCallback to prevent recreation on each render
  const handleSetTimeScale = useCallback((scale) => {
    // Always keep monthly scale
    if (scale !== "monthly") return;

    setIsTransitioning(true);
    setTimeScale("monthly");
    setZoomRange(null);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, []);

  const handleSetZoomRange = useCallback((startDate, endDate) => {
    // No zoom functionality in monthly view
    return;
  }, []);

  const handleResetZoom = useCallback(() => {
    // No zoom functionality in monthly view
    setZoomRange(null);
    setTimeScale("monthly");
  }, []);

  // Add mock data generation function
  const generateMockData = () => {
    // Use fixed years starting from 2021 instead of relative years
    const startYear = 2021;
    const endYear = 2025;

    const mockClient = {
      id: "mock-user",
      firstName: "Demo",
      lastName: "User",
      username: "demo_athlete",
      profileColor: "#A8E6CF",
    };

    // Generate 5 years of progression data with more realistic patterns and few missing months
    const generateProgression = (startWeight, yearlyIncrease, liftType) => {
      const progression = [];

      // Maximum weights to cap progression
      const maxWeights = {
        squat: 250,
        bench: 140,
        deadlift: 270,
      };

      // Log for debugging
      console.log(
        `[DEBUG] Generating ${liftType} progression from ${startYear} to ${endYear}`
      );

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

        console.log(
          `[DEBUG] ${liftType} target for ${year}: ${yearEndWeights[year]}kg`
        );
      }

      // Track the all-time best to avoid regressions
      let allTimeBest = startWeight - 5;

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

        // Get all months except those we want to skip
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

        console.log(
          `[${liftType}] Year ${year}: Base weight = ${baseWeight}kg, Target = ${yearEndWeights[yearString]}kg`
        );

        // Get unique progression pattern for this lift and year
        const progressPattern = createProgressPattern(year, liftType);
        const sortedProgressMonths = progressPattern.months;

        // Calculate the weight jumps
        // Make jumps more dramatic with bigger increases
        const totalProgressNeeded = yearEndWeights[yearString] - allTimeBest;
        const prMonthCount = sortedProgressMonths.length;

        // Big average jump for dramatic effect
        const averageJumpPerProgressMonth = Math.max(
          3, // Minimum 3kg jumps instead of 6kg
          Math.round((totalProgressNeeded / prMonthCount) * 1.2) // Increase by 20% instead of 50%
        );

        // Only create entries for months with PRs
        let currentYearBest = allTimeBest;

        // Track the months we actually log PRs for
        for (
          let monthIndex = 0;
          monthIndex < sortedProgressMonths.length;
          monthIndex++
        ) {
          const month = sortedProgressMonths[monthIndex];

          // Add realistic variability in jumps
          let jumpMultiplier = 1.0;

          // First PR of the year is bigger
          if (monthIndex === 0) {
            jumpMultiplier = 1.5; // 50% bigger jump to start the year
          }
          // Last PR of the year is also bigger
          else if (monthIndex === sortedProgressMonths.length - 1) {
            jumpMultiplier = 1.3; // 30% bigger jump to end the year
          }
          // Special big jumps occasionally (20% chance)
          else if (Math.random() < 0.2) {
            jumpMultiplier = 1.8; // 1.8x sized breakthrough
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
          currentYearBest += increase;

          // Make sure we don't exceed the year-end target too early
          if (
            month < 9 &&
            currentYearBest >= yearEndWeights[yearString] &&
            monthIndex < sortedProgressMonths.length - 1
          ) {
            currentYearBest =
              yearEndWeights[yearString] - Math.ceil(Math.random() * 10);
          }

          // Ensure we hit the year-end target exactly with the last PR of the year
          if (monthIndex === sortedProgressMonths.length - 1) {
            currentYearBest = yearEndWeights[yearString];
            console.log(
              `[DEBUG] ${liftType} final PR for ${yearString}: ${currentYearBest}kg`
            );
          }

          // Only log entry on PR months
          // Create a date for this month (different day each time for realism)
          const date = new Date(
            year,
            month,
            10 + Math.floor(Math.random() * 15)
          );

          // Double check the date is in the correct year
          if (date.getFullYear() !== year) {
            console.error(
              `[ERROR] Date year mismatch: expected ${year}, got ${date.getFullYear()}`
            );
            // Correct the year if needed
            date.setFullYear(year);
          }

          progression.push({
            weight: currentYearBest,
            date,
          });

          console.log(
            `[DEBUG] Added ${liftType} PR for ${year}-${
              month + 1
            }: ${currentYearBest}kg on ${date.toISOString()}`
          );
        }

        // Update the all-time best after each year
        allTimeBest = currentYearBest;
      }

      return progression;
    };

    // Generate mock progression data with 2021 starting weights and more realistic patterns
    const squatProgression = generateProgression(50, 15, "squat"); // Start: 50kg in 2021, +15kg/year
    const benchProgression = generateProgression(30, 9, "bench"); // Start: 30kg in 2021, +9kg/year
    const deadliftProgression = generateProgression(60, 18, "deadlift"); // Start: 60kg in 2021, +18kg/year

    // Calculate the max weights for the selected year only
    const yearMaxes = calculateYearMaxes(
      squatProgression,
      benchProgression,
      deadliftProgression,
      selectedYear
    );

    // Process data for charts
    const squatData = processProgressionData(squatProgression);
    const benchData = processProgressionData(benchProgression);
    const deadliftData = processProgressionData(deadliftProgression);

    // Set client data with mock data
    setSelectedClient({
      ...mockClient,
      analytics: {
        squatData,
        benchData,
        deadliftData,
        currentMaxes: yearMaxes,
        // Store the original progression data for year changes
        squatProgression,
        benchProgression,
        deadliftProgression,
      },
    });

    // If the selected year is outside our range, select the first year
    if (
      parseInt(selectedYear) < startYear ||
      parseInt(selectedYear) > endYear
    ) {
      handleYearSelect(startYear.toString());
    }
  };

  // Get current year and create array of last 5 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // Add useEffect to reload data when year changes
  useEffect(() => {
    if (selectedClient) {
      handleClientSelect(selectedClient);
    }
  }, [selectedYear]);

  // Update year selection to close dropdown after selection and regenerate chart data
  const handleYearSelect = (year) => {
    console.log(`[DEBUG] Year selected: ${year}`);
    setSelectedYear(year);
    setShowYearDropdown(false);

    // Set loading and transition states when changing years
    setIsLoading(true);
    setIsTransitioning(true);

    // Update max weights for the selected year if a client is selected
    if (selectedClient && selectedClient.analytics) {
      const analyticsData = selectedClient.analytics;

      if (selectedClient.id === "mock-user" && analyticsData.squatProgression) {
        // For mock user, use stored progression data
        console.log(`[DEBUG] Recalculating mock data for year: ${year}`);

        try {
          // Recalculate chart data for the new year
          const squatData = processProgressionData(
            analyticsData.squatProgression,
            year // Explicitly pass the year
          );
          const benchData = processProgressionData(
            analyticsData.benchProgression,
            year // Explicitly pass the year
          );
          const deadliftData = processProgressionData(
            analyticsData.deadliftProgression,
            year // Explicitly pass the year
          );

          const yearMaxes = calculateYearMaxes(
            analyticsData.squatProgression,
            analyticsData.benchProgression,
            analyticsData.deadliftProgression,
            year
          );

          console.log(`[DEBUG] Updated maxes for year ${year}:`, {
            squat: yearMaxes.squat.weight,
            bench: yearMaxes.bench.weight,
            deadlift: yearMaxes.deadlift.weight,
          });

          // Update the client state with new max values AND new chart data
          setSelectedClient({
            ...selectedClient,
            analytics: {
              ...analyticsData,
              squatData,
              benchData,
              deadliftData,
              currentMaxes: yearMaxes,
            },
          });
        } catch (error) {
          console.error("[DEBUG] Error updating mock data:", error);
        } finally {
          // Clear loading and transition states after update completes
          setTimeout(() => {
            setIsTransitioning(false);
            setIsLoading(false);
          }, 300); // Short delay for smoother transition
        }
      } else {
        // For real users, get from database
        const clientRef = doc(db, "analytics", selectedClient.id);
        getDoc(clientRef)
          .then((doc) => {
            if (doc.exists()) {
              const data = doc.data();

              // Process data for charts
              const squatData = processProgressionData(
                data.squatProgression || [],
                year
              );
              const benchData = processProgressionData(
                data.benchProgression || [],
                year
              );
              const deadliftData = processProgressionData(
                data.deadliftProgression || [],
                year
              );

              // Recalculate the max weights for the new year
              const yearMaxes = calculateYearMaxes(
                data.squatProgression || [],
                data.benchProgression || [],
                data.deadliftProgression || [],
                year
              );

              // Update the client state with new max values AND new chart data
              setSelectedClient({
                ...selectedClient,
                analytics: {
                  ...analyticsData,
                  squatData,
                  benchData,
                  deadliftData,
                  currentMaxes: yearMaxes,
                  // Preserve original progression data
                  squatProgression: data.squatProgression || [],
                  benchProgression: data.benchProgression || [],
                  deadliftProgression: data.deadliftProgression || [],
                },
              });
            }
            // Clear loading state after data is loaded
            setTimeout(() => {
              setIsTransitioning(false);
              setIsLoading(false);
            }, 300); // Short delay for smoother transition
          })
          .catch((error) => {
            console.error("[DEBUG] Error updating year maxes:", error);
            // Clear loading state on error
            setTimeout(() => {
              setIsTransitioning(false);
              setIsLoading(false);
            }, 300); // Short delay for smoother transition
          });
      }
    } else {
      // No client selected or no analytics data, clear loading state
      setTimeout(() => {
        setIsTransitioning(false);
        setIsLoading(false);
      }, 300); // Short delay for smoother transition
    }
  };

  // Convert pounds to kilograms
  const lbsToKg = (lbs) => {
    return Math.round((lbs / 2.20462) * 10) / 10; // Convert and round to 1 decimal place
  };

  // Add state for tooltips and modals
  const [tooltipData, setTooltipData] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [showMaxDateModal, setShowMaxDateModal] = useState(false);
  const [selectedMax, setSelectedMax] = useState(null);
  const [showDataPointModal, setShowDataPointModal] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsLoading(true);
    try {
      console.log("[DEBUG] Searching for clients with query:", query);
      const coachId = auth.currentUser.uid;
      console.log("[DEBUG] Coach ID:", coachId);

      // Get the coach's document to get their client list
      const coachDoc = await getDoc(doc(db, "users", coachId));
      const coachData = coachDoc.data();

      if (!coachData) {
        console.error("[DEBUG] No coach data found");
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      // Get the list of athlete IDs from both arrays
      const athleteIds = [
        ...(coachData.athletes || []),
        ...(coachData.clientList || []).map((client) => client.athleteId),
      ];

      // Remove duplicates
      const uniqueAthleteIds = [...new Set(athleteIds)];
      console.log("[DEBUG] Found athlete IDs:", uniqueAthleteIds);

      // Fetch each athlete's details
      const athleteDetails = await Promise.all(
        uniqueAthleteIds.map(async (athleteId) => {
          const athleteDoc = await getDoc(doc(db, "users", athleteId));
          return {
            id: athleteId,
            ...athleteDoc.data(),
          };
        })
      );

      // Filter athletes based on search query
      const filteredAthletes = athleteDetails.filter((athlete) => {
        const searchLower = query.toLowerCase();
        return (
          athlete.firstName?.toLowerCase().includes(searchLower) ||
          athlete.lastName?.toLowerCase().includes(searchLower) ||
          athlete.username?.toLowerCase().includes(searchLower)
        );
      });

      console.log("[DEBUG] Filtered athletes:", filteredAthletes.length);
      setSearchResults(filteredAthletes);
    } catch (error) {
      console.error("[DEBUG] Error searching clients:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientSelect = async (client) => {
    setIsLoading(true);
    setSelectedClient(client);

    // Clear previous tooltips
    setTooltipData(null);

    // Clear previous search
    setSearchQuery("");
    setSearchResults([]);

    try {
      // For mock user, generate data
      if (client.id === "mock-user") {
        console.log("[DEBUG] Generating mock data for client");
        generateMockData();
      } else {
        // For actual clients, fetch from Firestore
        const clientRef = doc(db, "analytics", client.id);
        const clientData = await getDoc(clientRef);

        if (clientData.exists()) {
          const data = clientData.data();

          // Process data for charts
          const squatData = processProgressionData(data.squatProgression || []);
          const benchData = processProgressionData(data.benchProgression || []);
          const deadliftData = processProgressionData(
            data.deadliftProgression || []
          );

          // Calculate the max weights for the selected year
          const yearMaxes = calculateYearMaxes(
            data.squatProgression || [],
            data.benchProgression || [],
            data.deadliftProgression || [],
            selectedYear
          );

          // Log max weights for debugging
          console.log(`[DEBUG] Max squat: ${yearMaxes.squat.weight}kg`);
          console.log(`[DEBUG] Max bench: ${yearMaxes.bench.weight}kg`);
          console.log(`[DEBUG] Max deadlift: ${yearMaxes.deadlift.weight}kg`);

          // Update client state with analytics data
          setSelectedClient({
            ...client,
            analytics: {
              squatData,
              benchData,
              deadliftData,
              currentMaxes: yearMaxes,
              // Store the original progression data for year changes
              squatProgression: data.squatProgression || [],
              benchProgression: data.benchProgression || [],
              deadliftProgression: data.deadliftProgression || [],
            },
          });
        } else {
          // No analytics data for this client
          setSelectedClient({
            ...client,
            analytics: {
              squatData: createEmptyDataset(),
              benchData: createEmptyDataset(),
              deadliftData: createEmptyDataset(),
              currentMaxes: {
                squat: { weight: 0, achievedAt: new Date() },
                bench: { weight: 0, achievedAt: new Date() },
                deadlift: { weight: 0, achievedAt: new Date() },
              },
            },
          });
        }
      }
    } catch (error) {
      console.error("[DEBUG] Error fetching client data:", error);
      Alert.alert("Error", "Failed to load client data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to calculate the max weights for a specific year
  const calculateYearMaxes = (squatData, benchData, deadliftData, year) => {
    const getYearMax = (progressionData) => {
      // Filter for selected year - ensure exact year match
      const yearData = progressionData.filter((entry) => {
        const entryDate =
          entry.date instanceof Date ? entry.date : entry.date.toDate();
        // Explicitly convert to string to ensure matching format
        const entryYear = entryDate.getFullYear().toString();
        const targetYear = year.toString();

        console.log(
          `[DEBUG] Comparing entry year: ${entryYear} with target year: ${targetYear}`
        );
        return entryYear === targetYear;
      });

      if (yearData.length === 0) {
        console.log(`[DEBUG] No data found for year ${year}`);
        return { weight: 0, achievedAt: new Date() };
      }

      // Log all entries found for this year to debug
      console.log(`[DEBUG] Found ${yearData.length} entries for year ${year}`);
      yearData.forEach((entry, i) => {
        const entryDate =
          entry.date instanceof Date ? entry.date : entry.date.toDate();
        console.log(
          `[DEBUG] Entry ${i}: weight=${
            entry.weight
          }kg, date=${entryDate.toISOString()}`
        );
      });

      // Simply find the maximum weight entry for the year
      const maxEntry = yearData.reduce((max, entry) => {
        return entry.weight > max.weight ? entry : max;
      }, yearData[0]);

      console.log(
        `[DEBUG] Final year max for ${year}: ${maxEntry.weight}kg, date: ${
          maxEntry.date instanceof Date
            ? maxEntry.date.toISOString()
            : maxEntry.date.toDate().toISOString()
        }`
      );

      return {
        weight: maxEntry.weight,
        achievedAt:
          maxEntry.date instanceof Date
            ? maxEntry.date
            : maxEntry.date.toDate(),
      };
    };

    return {
      squat: getYearMax(squatData),
      bench: getYearMax(benchData),
      deadlift: getYearMax(deadliftData),
    };
  };

  // Create empty dataset for when there's no data
  const createEmptyDataset = () => {
    return {
      labels: [],
      datasets: [
        {
          data: [],
          strokeWidth: 3,
        },
      ],
      dates: [],
      isPRMonth: [],
    };
  };

  // Process progression data from Firestore into chart format
  const processProgressionData = (progressionArray, explicitYear = null) => {
    // Use the explicitly passed year if provided, otherwise use the selectedYear state
    const yearToUse = explicitYear || selectedYear;
    console.log(`[DEBUG] Processing progression data for year: ${yearToUse}`);

    // Filter for selected year and sort progression by date
    const yearData = progressionArray.filter((entry) => {
      const entryDate =
        entry.date instanceof Date ? entry.date : entry.date.toDate();
      const entryYear = entryDate.getFullYear().toString();
      return entryYear === yearToUse;
    });

    console.log(
      `[DEBUG] Found ${yearData.length} entries for year ${yearToUse}`
    );

    // Sort data by date (older to newer)
    const sortedProgression = [...yearData].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : a.date.toDate();
      const dateB = b.date instanceof Date ? b.date : b.date.toDate();
      return dateA - dateB;
    });

    // Make sure there's data
    if (sortedProgression.length === 0) {
      console.log(`[DEBUG] No progression data for year ${yearToUse}`);
      return createEmptyDataset();
    }

    // Find the last month's data point to ensure consistency with the displayed max
    const lastEntryByDate = [...sortedProgression].sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : a.date.toDate();
      const dateB = b.date instanceof Date ? b.date : b.date.toDate();
      return dateB - dateA; // Sort by most recent first
    })[0];

    // Find the max weight entry
    const maxEntry = sortedProgression.reduce((max, entry) => {
      return entry.weight > max.weight ? entry : max;
    }, sortedProgression[0]);

    // Log for debugging
    console.log(
      `[DEBUG] Last entry weight: ${lastEntryByDate.weight}kg, Max weight: ${maxEntry.weight}kg`
    );

    // Make sure the max entry is included in the data (and displayed in the graph)
    let processedData = processMonthlyData(
      sortedProgression,
      maxEntry.weight,
      yearToUse
    );

    // Verify the max weight in the processed data matches our expectations
    const graphMax = Math.max(
      ...processedData.datasets[0].data.filter((val) => val > 0)
    );
    console.log(
      `[DEBUG] Graph max: ${graphMax}kg, Should match: ${maxEntry.weight}kg`
    );

    return processedData;
  };

  // Process data in monthly format - only show increases and plateaus
  const processMonthlyData = (sortedProgression, maxWeight, year = null) => {
    // Use the passed year or fall back to selectedYear
    const yearToUse = year || selectedYear;

    // Create array of all 12 months
    const monthLabels = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Maps to store highest weight per month
    const monthDataMap = new Map();
    const monthDatesMap = new Map();
    const isPRMonthMap = new Map(); // Track which months have actual PRs

    // Find the latest entry by date
    let lastEntry = sortedProgression[0];
    if (sortedProgression.length > 1) {
      lastEntry = [...sortedProgression].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : a.date.toDate();
        const dateB = b.date instanceof Date ? b.date : b.date.toDate();
        return dateB - dateA; // Most recent first
      })[0];
    }

    // Process data by month
    sortedProgression.forEach((entry) => {
      const entryDate =
        entry.date instanceof Date ? entry.date : entry.date.toDate();
      const month = entryDate.getMonth();

      // Keep only the highest weight for each month
      if (monthDataMap.has(month)) {
        if (entry.weight > monthDataMap.get(month)) {
          monthDataMap.set(month, entry.weight);
          monthDatesMap.set(month, entryDate.toISOString().split("T")[0]);
          isPRMonthMap.set(month, true); // This is a PR month
        }
      } else {
        monthDataMap.set(month, entry.weight);
        monthDatesMap.set(month, entryDate.toISOString().split("T")[0]);
        isPRMonthMap.set(month, true); // This is a PR month
      }
    });

    // Fill in the data array for all 12 months
    const data = [];
    const dates = [];
    const validLabels = [];
    const isPRMonth = []; // Track which points are actual PRs for rendering

    // Keep track of highest weight so far to ensure no decreases
    let highestWeightSoFar = 0;
    // Track consecutive months without PR to add small increases
    let monthsWithoutPR = 0;

    monthLabels.forEach((label, month) => {
      validLabels.push(label); // Always include all month labels

      if (monthDataMap.has(month)) {
        // Use actual data point for this month
        let value = monthDataMap.get(month);

        // Ensure weight never decreases
        if (value < highestWeightSoFar) {
          // If this month's weight is less than previous max, use previous max
          value = highestWeightSoFar;
          // This is no longer a PR month since we're using the previous max
          isPRMonthMap.set(month, false);
        } else {
          // Update highest weight if this is higher
          highestWeightSoFar = value;
          // Reset consecutive non-PR counter
          monthsWithoutPR = 0;
        }

        data.push(value);
        dates.push(monthDatesMap.get(month));
        isPRMonth.push(isPRMonthMap.get(month)); // Check if it's a PR month
      } else if (highestWeightSoFar > 0) {
        // For months without data, avoid long plateaus
        monthsWithoutPR++;

        // Add small incremental increases instead of flat plateaus
        // after 2 months without a PR
        if (monthsWithoutPR > 1) {
          // Tiny progress (0.5-1.5kg) even without a PR to avoid plateaus
          const smallIncrease = 0.5 + Math.random();
          highestWeightSoFar += smallIncrease;
        }

        data.push(highestWeightSoFar);

        // Use a placeholder date for this empty month
        const monthDate = new Date(parseInt(yearToUse), month, 15);
        dates.push(monthDate.toISOString().split("T")[0]);
        isPRMonth.push(false); // Not a PR month
      } else {
        // No data for this month and no previous data
        data.push(0);
        const monthDate = new Date(parseInt(yearToUse), month, 15);
        dates.push(monthDate.toISOString().split("T")[0]);
        isPRMonth.push(false); // Not a PR month
      }
    });

    // Ensure December always has the year's max value (for visual consistency with displayed max)
    const graphMaxValue = Math.max(...data.filter((val) => val > 0)); // Get maximum value from graph data
    const actualMax = maxWeight || graphMaxValue; // Use provided max weight if available

    // Make sure at least one point in the graph shows the actual max
    let hasActualMax = data.includes(actualMax);

    if (!hasActualMax && actualMax > 0) {
      // Find the last month with data to show the max
      let lastMonthWithData = 11; // Default to December
      for (let m = 11; m >= 0; m--) {
        if (data[m] > 0) {
          lastMonthWithData = m;
          break;
        }
      }

      // Update that month to show the actual max
      data[lastMonthWithData] = actualMax;
      isPRMonth[lastMonthWithData] = true; // Mark as PR month
    }

    // If December has no data but should have the max, add it there
    if (!monthDataMap.has(11) && actualMax > 0) {
      // December is index 11
      data[11] = actualMax;
      const decemberDate = new Date(parseInt(yearToUse), 11, 28);
      dates[11] = decemberDate.toISOString().split("T")[0];
      isPRMonth[11] = true; // Mark as PR month so it's clickable
      console.log(`[DEBUG] Added max value ${actualMax}kg to December`);
    }

    return {
      labels: validLabels,
      datasets: [{ data, strokeWidth: 3 }],
      dates,
      isPRMonth, // Track which points are actual PRs
      scale: "monthly",
    };
  };

  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Add max date click handler
  const handleMaxLiftClick = (liftType) => {
    setSelectedMax({
      type: liftType,
      weight: selectedClient.analytics.currentMaxes[liftType].weight,
      achievedAt: selectedClient.analytics.currentMaxes[liftType].achievedAt,
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

  const renderChart = (data, title, color, dataKey) => {
    if (!data) return null;

    // Get the correct data based on the lift type
    const chartData = {
      labels: data[`${dataKey}Data`]?.labels || [],
      datasets: [
        {
          data: data[`${dataKey}Data`]?.datasets[0]?.data || [],
          color: (opacity = 1) =>
            color +
            Math.round(opacity * 255)
              .toString(16)
              .padStart(2, "0"),
          strokeWidth: 3,
        },
      ],
      dates: data[`${dataKey}Data`]?.dates || [],
      isPRMonth: data[`${dataKey}Data`]?.isPRMonth || [],
      scale: "monthly", // Always use monthly scale
      splitPoint: data[`${dataKey}Data`]?.splitPoint,
    };

    // Check if there's any data for this year
    const hasData =
      data[`${dataKey}Data`] !== null && chartData.datasets[0].data.length > 0;

    if (!hasData) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: "#666" }]}>
            No {title.toLowerCase()} data available for {selectedYear}
          </Text>
        </View>
      );
    }

    // Get y-axis config based on lift data
    const yAxisConfig = getYAxisConfig(data[`${dataKey}Data`]);

    // Custom labels for monthly view
    const getCustomLabels = () => chartData.labels;

    return (
      <View style={styles.singleChartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{title}</Text>
          {/* Time scale buttons removed */}
        </View>

        {isTransitioning ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <LineChart
            data={{
              labels: getCustomLabels(),
              datasets: chartData.datasets,
            }}
            width={Dimensions.get("window").width - 32}
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

                // Create more detailed data point information
                setSelectedDataPoint({
                  title: `${title} - ${month} ${selectedYear}`,
                  value: weight, // This is the max PB for the month
                  weight: weight, // Add this explicitly for consistency
                  date,
                  color,
                  week: month, // For monthly view, use month instead of week
                  description: `Max ${title.toLowerCase()} PR in ${month}`,
                  subtitle: `Personal Best: ${weight}kg`,
                });

                setShowDataPointModal(true);
              }
            }}
            bezier={false} // Use straight lines instead of bezier curves
            withDots={true} // Show dots for each data point
            fromZero={false} // Start y-axis from zero
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
        )}
      </View>
    );
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

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    if (selectedClient) {
      await handleClientSelect(selectedClient);
    }
    setRefreshing(false);
  }, [selectedClient]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client Analytics</Text>

      <TouchableOpacity style={styles.testButton} onPress={generateMockData}>
        <Text style={styles.testButtonText}>Load Demo Data</Text>
      </TouchableOpacity>

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : searchQuery && searchResults.length > 0 ? (
        <ScrollView
          style={styles.searchResults}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {searchResults.map((client) => (
            <TouchableOpacity
              key={client.id}
              style={styles.searchResultItem}
              onPress={() => handleClientSelect(client)}
            >
              <View
                style={[
                  styles.clientInitial,
                  { backgroundColor: client.profileColor || "#A8E6CF" },
                ]}
              >
                <Text style={styles.initialText}>{client.firstName[0]}</Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientNameText}>
                  {client.firstName} {client.lastName}
                </Text>
                <Text style={styles.usernameText}>@{client.username}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : searchQuery ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No clients found</Text>
        </View>
      ) : null}

      {selectedClient?.analytics && (
        <ScrollView
          style={styles.chartContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.clientName}>
                {selectedClient.firstName} {selectedClient.lastName}
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

          {selectedClient.analytics.squatData === null &&
          selectedClient.analytics.benchData === null &&
          selectedClient.analytics.deadliftData === null ? (
            <View style={[styles.noDataContainer, { marginTop: 50 }]}>
              <Text style={styles.noDataText}>
                No data available for {selectedYear}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.maxLiftsContainer}>
                <TouchableOpacity
                  style={[
                    styles.maxLiftCard,
                    { borderColor: "rgba(173, 216, 230, 1)" },
                  ]}
                  onPress={() => handleMaxLiftClick("squat")}
                >
                  <Text style={styles.maxLiftLabel}>Squat</Text>
                  <Text style={styles.maxLiftValue}>
                    {selectedClient.analytics.currentMaxes.squat.weight} kg
                  </Text>
                  <Icon
                    name="calendar-outline"
                    size={12}
                    color="#666"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.maxLiftCard,
                    { borderColor: "rgba(255, 182, 193, 1)" },
                  ]}
                  onPress={() => handleMaxLiftClick("bench")}
                >
                  <Text style={styles.maxLiftLabel}>Bench</Text>
                  <Text style={styles.maxLiftValue}>
                    {selectedClient.analytics.currentMaxes.bench.weight} kg
                  </Text>
                  <Icon
                    name="calendar-outline"
                    size={12}
                    color="#666"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.maxLiftCard,
                    { borderColor: "rgba(144, 238, 144, 1)" },
                  ]}
                  onPress={() => handleMaxLiftClick("deadlift")}
                >
                  <Text style={styles.maxLiftLabel}>Deadlift</Text>
                  <Text style={styles.maxLiftValue}>
                    {selectedClient.analytics.currentMaxes.deadlift.weight} kg
                  </Text>
                  <Icon
                    name="calendar-outline"
                    size={12}
                    color="#666"
                    style={styles.calendarIcon}
                  />
                </TouchableOpacity>
              </View>

              {renderChart(
                selectedClient.analytics,
                "Squat",
                "rgba(173, 216, 230, 1)",
                "squat"
              )}
              {renderChart(
                selectedClient.analytics,
                "Bench Press",
                "rgba(255, 182, 193, 1)",
                "bench"
              )}
              {renderChart(
                selectedClient.analytics,
                "Deadlift",
                "rgba(144, 238, 144, 1)",
                "deadlift"
              )}
            </>
          )}
        </ScrollView>
      )}

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
            <Text style={styles.maxDateWeight}>
              {selectedMax?.weight || 0} kg
            </Text>
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

      {/* Data Point Modal */}
      <Modal
        visible={showDataPointModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDataPointModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDataPointModal(false)}
        >
          <View
            style={[
              styles.maxDateContainer,
              { borderLeftWidth: 3, borderLeftColor: selectedDataPoint?.color },
            ]}
          >
            <Text style={styles.maxDateTitle}>{selectedDataPoint?.title}</Text>

            <Text style={[styles.maxDateLabel, { marginTop: 10 }]}>
              Personal Best
            </Text>
            <Text style={styles.maxDateWeight}>
              {selectedDataPoint?.weight} kg
            </Text>

            {selectedDataPoint?.description && (
              <Text
                style={[
                  styles.maxDateLabel,
                  { fontSize: 14, marginTop: 5, color: "#666" },
                ]}
              >
                {selectedDataPoint?.description}
              </Text>
            )}

            <Text
              style={[
                styles.maxDateLabel,
                { fontSize: 12, color: "#666", marginTop: 15 },
              ]}
            >
              Date:
            </Text>
            <Text style={[styles.maxDateValue, { fontSize: 14 }]}>
              {selectedDataPoint?.date
                ? formatDate(selectedDataPoint.date)
                : "N/A"}
            </Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDataPointModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
    padding: 0,
    paddingTop: 80,
    paddingLeft: 35,
    paddingRight: 35,
    paddingHorizontal: 16,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 0,
    marginTop: 60,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 8,
    marginHorizontal: 0,
    maxWidth: "90%",
    alignSelf: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
    marginLeft: 5,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 15,
  },
  searchResults: {
    maxHeight: 200,
    marginBottom: 20,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  clientInitial: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  initialText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  clientInfo: {
    flex: 1,
  },
  clientNameText: {
    fontSize: 16,
    fontWeight: "600",
    paddingLeft: 20,
  },
  usernameText: {
    fontSize: 14,
    color: "#666",
    paddingLeft: 20,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
  },
  chartContainer: {
    marginTop: 20,
    width: Dimensions.get("window").width - 32,
    marginHorizontal: -16,
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
    marginRight: 10,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
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
  maxLiftsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 0,
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
    fontSize: 22,
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
    backgroundColor: "#f2f2f0",
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
  noDataContainer: {
    padding: 20,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
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
  singleChartContainer: {
    width: Dimensions.get("window").width - 32,
    marginLeft: -16,
    marginRight: -16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  timeScaleButtons: {
    flexDirection: "row",
  },
  scaleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 5,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  activeScaleButton: {
    backgroundColor: "#000",
  },
  scaleButtonText: {
    fontSize: 10,
    color: "#666",
  },
  resetZoomButton: {
    backgroundColor: "#666",
  },
  loadingContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  scaleIndicator: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    alignItems: "center",
  },
  scaleIndicatorLine: {
    width: "80%",
    height: 1,
    backgroundColor: "#ddd",
  },
  scaleIndicatorText: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },
});

export default ClientsStats;
