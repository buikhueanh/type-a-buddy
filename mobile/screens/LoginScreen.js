// mobile/screens/LoginScreen.js
import React, { useState } from "react";
import { Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { login } from "../lib/api";
import { Colors, Spacing, Typography } from "../theme";

export default function LoginScreen({ onGoSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  async function onSubmit() {
    setError(null);
    setSuccess(null);
    try {
      await login(email.trim(), password);
      setSuccess("+5 XP Welcome back.");
    } catch (e) {
      setError(e.message || "Login failed");
    }
  }

  return (
    <Screen>
      <View style={{ alignItems: "center" }}>
        <Text style={[Typography.h1, { color: Colors.text }]}>
          Welcome Back
        </Text>
        <Text
          style={[
            Typography.body,
            { color: Colors.muted, marginTop: Spacing.sm },
          ]}
        >
          Log in to keep your streak going.
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

          {success ? (
            <Text style={{ marginTop: Spacing.lg, color: Colors.success }}>
              {success}
            </Text>
          ) : null}
          {error ? (
            <Text style={{ marginTop: Spacing.lg, color: Colors.danger }}>
              {error}
            </Text>
          ) : null}

          <View style={{ marginTop: Spacing.xl }}>
            <Button title="Login" onPress={onSubmit} leftDot />
          </View>

          <View style={{ marginTop: Spacing.md }}>
            <Button
              title="Create an account"
              onPress={onGoSignup}
              variant="secondary"
            />
          </View>
        </Card>
      </View>
    </Screen>
  );
}
