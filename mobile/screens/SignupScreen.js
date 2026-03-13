import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { register } from "../lib/api";
import { Colors, Spacing, Typography } from "../theme";

export default function SignupScreen({ onGoLogin, onGoHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function onSubmit() {
    setError(null);
    setStatus("Creating your account...");
    try {
      await register(email.trim(), password);
      setStatus("+10 XP Unlocked. Account created.");
      if (onGoHome) onGoHome();
    } catch (e) {
      setStatus(null);
      setError(e.message || "Sign up failed");
    }
  }

  return (
    <Screen>
      <View style={{ alignItems: "center" }}>
        <Text style={[Typography.h1, { color: Colors.text }]}>
          Level 1: Create Account
        </Text>
        <Text
          style={[
            Typography.body,
            { color: Colors.muted, marginTop: Spacing.sm },
          ]}
        >
          Planning should feel like a game. Let’s start.
        </Text>
      </View>

      <View style={{ marginTop: Spacing.xl }}>
        <Card>
          <TextField label="Email" value={email} onChangeText={setEmail} />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightLabel={showPassword ? "Hide" : "Show"}
            rightA11yLabel={showPassword ? "Hide password" : "Show password"}
            onRightPress={() => setShowPassword((v) => !v)}
          />

          {status ? (
            <Text style={{ marginTop: Spacing.lg, color: Colors.success }}>
              {status}
            </Text>
          ) : null}
          {error ? (
            <Text style={{ marginTop: Spacing.lg, color: Colors.danger }}>
              {error}
            </Text>
          ) : null}

          <View style={{ marginTop: Spacing.xl }}>
            <Button title="Create Account" onPress={onSubmit} />
          </View>

          <View style={{ marginTop: Spacing.xl, flexDirection: "row", justifyContent: "center", flexWrap: "wrap" }}>
            <Text style={[Typography.small, { color: Colors.muted }]}>Already have an account? </Text>
            <Pressable
              onPress={onGoLogin}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={[Typography.small, { color: Colors.secondary, fontWeight: "800" }]}>Sign In</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
