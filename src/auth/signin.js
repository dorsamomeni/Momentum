import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export const signin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Signin successful:", user.uid);

    return {
      user,
      userData: {
        email: user.email,
        displayName: user.displayName,
      },
    };
  } catch (error) {
    console.error("Signin error:", error);
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      throw { code: error.code, message: "Invalid email or password" };
    } else if (error.code === "auth/invalid-email") {
      throw { code: error.code, message: "Invalid email address" };
    } else {
      throw { code: "auth/unknown", message: `Login failed: ${error.message}` };
    }
  }
}; 