import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signin } from "../src/auth/signin";

const SignIn = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const result = await signin(email, password);
      console.log("Signin successful:", result);

      // Navigate all users to Clients screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Clients" }],
      });
    } catch (error) {
      console.log("Signin error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.welcomeText}>Log in to your account</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#666"
              returnKeyType="next"
              autoComplete="email"
              textContentType="emailAddress"
              enablesReturnKeyAutomatically
              importantForAutofill="yes"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#666"
              returnKeyType="done"
              autoComplete="password"
              textContentType="password"
              enablesReturnKeyAutomatically
              importantForAutofill="yes"
            />
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={loading}
          >
            <Text style={styles.signInButtonText}>
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUp")}
            activeOpacity={0.6}
          >
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 100,
    justifyContent: "space-between",
  },
  header: {
    marginBottom: 48,
    marginTop: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
    paddingLeft: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    paddingLeft: 4,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  inputContainer: {
    gap: 24,
    marginBottom: 60,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
    height: 56,
  },
  signInButton: {
    backgroundColor: "#000",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 40,
    gap: 4,
  },
  signUpText: {
    color: "#666",
    fontSize: 15,
  },
  signUpLink: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

export default SignIn;
