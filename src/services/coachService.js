import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Function to send a program to an athlete
export const sendProgramToAthlete = async (blockId, athleteId) => {
  try {
    const batch = writeBatch(db);

    // Get the block
    const blockDoc = await getDoc(doc(db, "blocks", blockId));
    if (!blockDoc.exists()) {
      throw new Error("Block not found");
    }

    // Update the block with athlete ID
    batch.update(doc(db, "blocks", blockId), {
      athleteId,
      sentAt: serverTimestamp(),
      status: "active",
    });

    // Update athlete document to reference this block
    const athleteRef = doc(db, "users", athleteId);
    const athleteDoc = await getDoc(athleteRef);

    if (athleteDoc.exists()) {
      batch.update(athleteRef, {
        activeBlocks: arrayUnion(blockId),
      });
    } else {
      throw new Error("Athlete not found");
    }

    // Commit all changes
    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error sending program to athlete:", error);
    throw error;
  }
};

// Function to get all athletes for a coach
export const getCoachAthletes = async (coachId) => {
  try {
    const athletesQuery = query(
      collection(db, "users"),
      where("coachId", "==", coachId),
      where("role", "==", "athlete")
    );

    const querySnapshot = await getDocs(athletesQuery);
    const athletes = [];

    querySnapshot.forEach((doc) => {
      athletes.push({ id: doc.id, ...doc.data() });
    });

    return athletes;
  } catch (error) {
    console.error("Error getting coach athletes:", error);
    throw error;
  }
};
