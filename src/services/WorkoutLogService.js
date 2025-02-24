import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  serverTimestamp,
  writeBatch,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

export const logWorkoutWeight = async (blockId, logData) => {
  try {
    const {
      athleteId,
      weekNumber,
      dayNumber,
      exerciseName,
      schemeIndex,
      weight,
      notes,
    } = logData;

    const batch = writeBatch(db);

    // Create workout log entry
    const workoutLog = {
      athleteId,
      blockId,
      weekNumber,
      dayNumber,
      exerciseName,
      schemeIndex,
      weight: parseFloat(weight),
      notes: notes || "",
      timestamp: serverTimestamp(),
    };

    // Add to workout logs collection
    const logRef = await addDoc(collection(db, "workoutLogs"), workoutLog);

    // Update the block document with the logged weight
    const blockRef = doc(db, "blocks", blockId);
    const weekPath = `weeks.${weekNumber - 1}.days.${dayNumber - 1}.exercises`;

    // We'll store the logged weight in the block for easy reference
    batch.update(blockRef, {
      [`${weekPath}.${exerciseName}.schemes.${schemeIndex}.loggedWeight`]:
        parseFloat(weight),
      [`${weekPath}.${exerciseName}.schemes.${schemeIndex}.loggedAt`]:
        serverTimestamp(),
    });

    // Update user's document with reference to the log
    const userRef = doc(db, "users", athleteId);
    batch.update(userRef, {
      workoutLogs: arrayUnion(logRef.id),
    });

    await batch.commit();
    return logRef.id;
  } catch (error) {
    console.error("Error logging workout:", error);
    throw error;
  }
};

export const getWorkoutLogs = async (athleteId, blockId) => {
  try {
    const logsQuery = query(
      collection(db, "workoutLogs"),
      where("athleteId", "==", athleteId),
      where("blockId", "==", blockId),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(logsQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting workout logs:", error);
    throw error;
  }
};
