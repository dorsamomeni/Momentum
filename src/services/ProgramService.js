import { db } from "../config/firebase";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

// Create a new block/program
export const createBlock = async (blockData) => {
  try {
    const blockId = `block_${Date.now()}`;
    const block = {
      id: blockId,
      ...blockData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: blockData.status || "draft",
      weeks: blockData.weeks.map((week, weekIndex) => ({
        weekNumber: weekIndex + 1,
        days: Array(blockData.sessionsPerWeek)
          .fill()
          .map((_, dayIndex) => ({
            dayNumber: dayIndex + 1,
            exercises: [],
          })),
      })),
    };

    const batch = writeBatch(db);

    // Create the block document
    const blockRef = doc(db, "blocks", blockId);
    batch.set(blockRef, block);

    // Update athlete's activeBlocks array
    const athleteRef = doc(db, "users", blockData.athleteId);
    batch.update(athleteRef, {
      activeBlocks: arrayUnion(blockId),
    });

    await batch.commit();
    return blockId;
  } catch (error) {
    console.error("Error creating block:", error);
    throw error;
  }
};

// Update an existing block
export const updateBlock = async (blockId, updateData) => {
  try {
    const blockRef = doc(db, "blocks", blockId);
    await updateDoc(blockRef, updateData);
  } catch (error) {
    console.error("Error updating block:", error);
    throw error;
  }
};

// Add or update exercises in a specific day of a week
export const updateBlockExercises = async (
  blockId,
  weekNumber,
  dayNumber,
  exercises
) => {
  try {
    const blockRef = doc(db, "blocks", blockId);
    const blockDoc = await getDoc(blockRef);
    const blockData = blockDoc.data();

    // Find the correct week and day
    const weeks = [...blockData.weeks];
    const weekIndex = weeks.findIndex((w) => w.weekNumber === weekNumber);

    if (weekIndex === -1) {
      throw new Error("Week not found");
    }

    const dayIndex = weeks[weekIndex].days.findIndex(
      (d) => d.dayNumber === dayNumber
    );
    if (dayIndex === -1) {
      throw new Error("Day not found");
    }

    // Update the exercises for that day
    weeks[weekIndex].days[dayIndex].exercises = exercises;

    await updateDoc(blockRef, {
      weeks,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating block exercises:", error);
    throw error;
  }
};

// Get all blocks for a coach
export const getCoachBlocks = async (coachId) => {
  try {
    const blocksQuery = query(
      collection(db, "blocks"),
      where("coachId", "==", coachId)
    );

    const snapshot = await getDocs(blocksQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting coach blocks:", error);
    throw error;
  }
};

// Get blocks for a specific athlete
export const getAthleteBlocks = async (athleteId) => {
  try {
    const blocksQuery = query(
      collection(db, "blocks"),
      where("athleteId", "==", athleteId),
      where("status", "==", "active")
    );

    const snapshot = await getDocs(blocksQuery);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting athlete blocks:", error);
    throw error;
  }
};

// Close/complete a block
export const closeBlock = async (blockId, athleteId) => {
  try {
    const batch = writeBatch(db);

    // Update block status
    const blockRef = doc(db, "blocks", blockId);
    batch.update(blockRef, {
      status: "completed",
      updatedAt: serverTimestamp(),
    });

    // Update athlete's block arrays
    const athleteRef = doc(db, "users", athleteId);
    batch.update(athleteRef, {
      activeBlocks: arrayRemove(blockId),
      previousBlocks: arrayUnion(blockId),
    });

    await batch.commit();
  } catch (error) {
    console.error("Error closing block:", error);
    throw error;
  }
};

// Delete a block (only if it's a draft)
export const deleteBlock = async (blockId) => {
  try {
    const blockRef = doc(db, "blocks", blockId);
    const blockDoc = await getDoc(blockRef);

    if (!blockDoc.exists()) {
      throw new Error("Block not found");
    }

    const blockData = blockDoc.data();
    if (blockData.status !== "draft") {
      throw new Error("Only draft blocks can be deleted");
    }

    await deleteDoc(blockRef);
  } catch (error) {
    console.error("Error deleting block:", error);
    throw error;
  }
};
