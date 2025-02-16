import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const signup = async (userData) => {
  const { email, password, firstName, lastName, username, role } = userData;

  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Auth user created:", user.uid);

    // Update display name with full name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });
    console.log("Display name updated to:", `${firstName} ${lastName}`);

    // Create user document with role-specific fields
    const userDocRef = doc(db, "users", user.uid);
    const userDataForStore = {
      firstName,
      lastName,
      username,
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
            status: "unassigned", // or 'pending' when they request a coach
          }
        : {
            athletes: [], // Array of athlete UIDs for coaches
          }),
    };

    await setDoc(userDocRef, userDataForStore);
    console.log("User data stored in Firestore");

    // Verify the update worked
    const updatedUser = auth.currentUser;
    console.log("Verified user data:", {
      displayName: updatedUser.displayName,
      email: updatedUser.email,
      role: role,
    });

    return {
      user: user,
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
