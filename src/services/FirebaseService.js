import { db } from "../config/firebase";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { auth } from "../config/firebase";

export const logWorkoutSet = async (athleteId, exerciseData) => {
  try {
    const workoutLog = {
      athleteId,
      exerciseName: exerciseData.name,
      weight: parseFloat(exerciseData.weight),
      reps: exerciseData.reps,
      sets: exerciseData.sets,
      rpe: exerciseData.rpe || null,
      notes: exerciseData.notes || "",
      timestamp: serverTimestamp(),
      blockId: exerciseData.blockId,
      weekNumber: exerciseData.weekNumber,
      dayNumber: exerciseData.dayNumber,
    };

    // Add to workout logs collection
    const logRef = await addDoc(collection(db, "workoutLogs"), workoutLog);

    // Update user's document with reference to the log
    const userRef = doc(db, "users", athleteId);
    await updateDoc(userRef, {
      workoutLogs: arrayUnion(logRef.id),
    });

    return logRef.id;
  } catch (error) {
    console.error("Error logging workout:", error);
    throw error;
  }
};

export const getWorkoutLogs = async (athleteId, filters = {}) => {
  try {
    let logsQuery = query(
      collection(db, "workoutLogs"),
      where("athleteId", "==", athleteId),
      orderBy("timestamp", "desc")
    );

    if (filters.exerciseName) {
      logsQuery = query(
        logsQuery,
        where("exerciseName", "==", filters.exerciseName)
      );
    }

    const querySnapshot = await getDocs(logsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching workout logs:", error);
    throw error;
  }
};

export const initializeCollections = async () => {
  try {
    // Check if collections exist by trying to get a document
    const checkCollection = async (collectionName) => {
      const snapshot = await getDocs(collection(db, collectionName));
      if (snapshot.empty) {
        console.log(`Initialized ${collectionName} collection`);
      }
    };

    // Initialize all required collections
    await checkCollection("users");
    await checkCollection("workoutLogs");
    await checkCollection("blocks");
  } catch (error) {
    console.error("Error initializing collections:", error);
    throw error;
  }
};

// Call this when your app starts
export const ensureDatabaseSetup = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user logged in during database setup");
      return false;
    }

    // Get user role first
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      console.log("User document not found");
      return false;
    }

    const userData = userDoc.data();
    console.log("User role:", userData.role);

    // Only proceed with initialization if user is authenticated
    if (userData.role === "coach") {
      // Coach-specific initialization
      const blocksQuery = query(
        collection(db, "blocks"),
        where("coachId", "==", user.uid)
      );
      await getDocs(blocksQuery);
    } else {
      // Athlete-specific initialization
      const blocksQuery = query(
        collection(db, "blocks"),
        where("athleteId", "==", user.uid)
      );
      await getDocs(blocksQuery);
    }

    return true;
  } catch (error) {
    console.error("Error during database setup:", error);
    return false;
  }
};

export const testWorkoutLogging = async () => {
  try {
    // 1. Create a test block first
    const blockId = `block_${Date.now()}`;
    const coachId = auth.currentUser.uid;
    const testAthleteId = "TEST_ATHLETE_ID"; // Replace with real athlete ID

    const blockData = {
      id: blockId,
      name: "Test Block",
      coachId: coachId,
      athleteId: testAthleteId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      sessionsPerWeek: 3,
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              dayNumber: 1,
              exercises: [
                {
                  name: "Squat",
                  schemes: [
                    {
                      description: "3x5 @RPE 7",
                      loggedWeight: null,
                    },
                  ],
                  notes: "Test notes",
                },
              ],
            },
          ],
        },
      ],
    };

    // Create block
    await createBlock(blockData);
    console.log("Test block created:", blockId);

    // 2. Log a workout
    const workoutData = {
      athleteId: testAthleteId,
      blockId: blockId,
      weekNumber: 1,
      dayNumber: 1,
      exerciseName: "Squat",
      schemeIndex: 0,
      weight: 100,
      notes: "Test workout log",
    };

    const logId = await logWorkoutWeight(blockId, workoutData);
    console.log("Workout logged:", logId);

    // 3. Fetch the logs
    const logs = await getWorkoutLogs(testAthleteId, blockId);
    console.log("Retrieved logs:", logs);

    return { success: true, blockId, logId, logs };
  } catch (error) {
    console.error("Test failed:", error);
    return { success: false, error: error.message };
  }
};

export const testFirebaseSetup = async () => {
  try {
    console.log("Starting Firebase setup test...");

    // 1. Test user read
    console.log("Testing user read...");
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }
    console.log("✓ User read successful");

    // 2. Test block read
    console.log("Testing block read...");
    const blocksQuery = query(
      collection(db, "blocks"),
      where(
        userDoc.data().role === "coach" ? "coachId" : "athleteId",
        "==",
        auth.currentUser.uid
      )
    );
    await getDocs(blocksQuery);
    console.log("✓ Block read successful");

    // 3. Test workout logs read
    console.log("Testing workout logs read...");
    if (userDoc.data().role === "coach") {
      // For coaches, get logs of their athletes
      const athleteIds = userDoc.data().athletes || [];
      if (athleteIds.length > 0) {
        const logsQuery = query(
          collection(db, "workoutLogs"),
          where("athleteId", "in", athleteIds)
        );
        await getDocs(logsQuery);
      }
    } else {
      // For athletes, get their own logs
      const logsQuery = query(
        collection(db, "workoutLogs"),
        where("athleteId", "==", auth.currentUser.uid)
      );
      await getDocs(logsQuery);
    }
    console.log("✓ Workout logs read successful");

    console.log("All tests passed successfully!");
    return true;
  } catch (error) {
    console.error("Firebase setup test failed:", error);
    return false;
  }
};
