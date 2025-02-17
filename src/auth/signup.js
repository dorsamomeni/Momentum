import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getFirestore, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const signup = async (userData) => {
  const { email, password, firstName, lastName, username, role } = userData;

  try {
    console.log("1. Creating auth user");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("2. Auth user created:", user.uid);

    // Update display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });
    console.log("3. Display name updated");

    // Create user document
    const userDocRef = doc(db, "users", user.uid);
    const userDataForStore = {
      firstName,
      lastName,
      username: username.toLowerCase(),
      email,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Role-specific fields
      ...(role === "athlete"
        ? {
            coachId: null,
            activeBlocks: [],
            previousBlocks: [],
            status: "unassigned",
          }
        : {
            athletes: [],
          }),
      coachRequests: [],
      pendingRequests: [],
      sentRequests: [],
      status: "inactive",
    };

    console.log("4. Attempting to create Firestore document");
    await setDoc(userDocRef, userDataForStore);
    console.log("5. Firestore document created successfully");

    return {
      user,
      userData: userDataForStore,
    };
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === "auth/email-already-in-use") {
      throw { code: error.code, message: "This email is already registered" };
    } else if (error.code === "auth/invalid-email") {
      throw { code: error.code, message: "Invalid email address" };
    } else if (error.code === "auth/weak-password") {
      throw {
        code: error.code,
        message: "Password should be at least 6 characters",
      };
    } else {
      throw {
        code: "auth/unknown",
        message: `Failed to create account: ${error.message}`,
      };
    }
  }
};
