import { createClient } from "@supabase/supabase-js";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import firebase from "firebase/app";
import "firebase/auth";

const supabaseUrl = "https://vdneurspphelgopdreey.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkbmV1cnNwcGhlbGdvcGRyZWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NTc4NjQsImV4cCI6MjA1MjAzMzg2NH0.5if9hfE9k2lS6cdRCRNQgTJHpSntPAtQm4gE2m4zs-E";
const supabase = createClient(supabaseUrl, supabaseKey);

const firebaseConfig = {
  apiKey: "AIzaSyCcEJPObD_XKxoiAoCdJhv77bGHtFdrlgQ",
  authDomain: "momentum-fb140.firebaseapp.com",
  projectId: "momentum-fb140",
  storageBucket: "momentum-fb140.firebasestorage.app",
  messagingSenderId: "432908468966",
  appId: "1:432908468966:web:d9048819ee31191ac8b127",
  measurementId: "G-BV8LC13DR0",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const signup = async (email, password) => {
  try {
    const { user, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (supabaseError) throw supabaseError;

    const firebaseUser = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);

    await supabase.from("users").insert([{ id: user.id, email: user.email }]);

    return { user: firebaseUser.user, supabaseUser: user };
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};
