import { db } from '../config/firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp 
} from 'firebase/firestore';

export const logWorkoutSet = async (athleteId, exerciseData) => {
  try {
    const workoutLog = {
      athleteId,
      exerciseName: exerciseData.name,
      weight: parseFloat(exerciseData.weight),
      reps: exerciseData.reps,
      sets: exerciseData.sets,
      rpe: exerciseData.rpe || null,
      notes: exerciseData.notes || '',
      timestamp: serverTimestamp(),
      blockId: exerciseData.blockId,
      weekNumber: exerciseData.weekNumber,
      dayNumber: exerciseData.dayNumber
    };

    // Add to workout logs collection
    const logRef = await addDoc(collection(db, 'workoutLogs'), workoutLog);

    // Update user's document with reference to the log
    const userRef = doc(db, 'users', athleteId);
    await updateDoc(userRef, {
      workoutLogs: arrayUnion(logRef.id)
    });

    return logRef.id;
  } catch (error) {
    console.error('Error logging workout:', error);
    throw error;
  }
};

export const getWorkoutLogs = async (athleteId, filters = {}) => {
  try {
    const logsQuery = query(
      collection(db, 'workoutLogs'),
      where('athleteId', '==', athleteId),
      orderBy('timestamp', 'desc')
    );

    if (filters.exerciseName) {
      logsQuery = query(logsQuery, where('exerciseName', '==', filters.exerciseName));
    }

    const querySnapshot = await getDocs(logsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    throw error;
  }
}; 