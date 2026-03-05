import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import TextField from "../components/TextField";
import Button from "../components/Button";
import { forgotPassword, resetPassword } from "../lib/api";
import { Colors, Spacing, Typography } from "../theme";

export default function ForgotPasswordScreen({ onGoLogin }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const canReset = useMemo(
    () => email.trim() && code.trim().length === 6 && newPassword.trim(),
    [email, code, newPassword]
  );

  async function onSendLink() {
    setError(null);
    setStatus("Requesting code...");

    try {
      const res = await forgotPassword(email.trim());
      // In dev, backend may return code for convenience.
      if (res && res.code) setCode(String(res.code));
      setStatus("If that email exists, a 6-digit code was sent.");
    } catch (e) {
      setStatus(null);
      setError(e.message || "Request failed");
    }
  }

  async function onReset() {
    setError(null);
    setStatus("Resetting password...");

    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      setStatus("Password updated. You can log in now.");
    } catch (e) {
      setStatus(null);
      setError(e.message || "Reset failed");
    }
  }

  return (
    <Screen>
      <View style={{ alignItems: "center" }}>
        <Text style={[Typography.h1, { color: Colors.text, textAlign: "center" }]}>Reset Password</Text>
        <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm, textAlign: "center" }]}
        >
          Enter your email to get a 6-digit code.
        </Text>
      </View>

      <View style={{ marginTop: Spacing.xl }}>
        <Card>
          <TextField label="Email" value={email} onChangeText={setEmail} />

          <View style={{ marginTop: Spacing.lg, alignItems: "center" }}>
            <Pressable
              onPress={onSendLink}
              accessibilityRole="button"
              accessibilityLabel="Send reset code"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={[Typography.small, { color: Colors.secondary, fontWeight: "800" }]}>Send code</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: Spacing.xl }}>
            <TextField
              label="6-digit code"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              autoCapitalize="none"
              maxLength={6}
            />
            <TextField
              label="New password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              rightLabel={showPassword ? "Hide" : "Show"}
              rightA11yLabel={showPassword ? "Hide password" : "Show password"}
              onRightPress={() => setShowPassword((v) => !v)}
            />

            <View style={{ marginTop: Spacing.xl, opacity: canReset ? 1 : 0.7 }}>
              <Button title="Reset password" onPress={onReset} />
            </View>
          </View>

          {status ? <Text style={{ marginTop: Spacing.lg, color: Colors.success }}>{status}</Text> : null}
          {error ? <Text style={{ marginTop: Spacing.lg, color: Colors.danger }}>{error}</Text> : null}

          <View style={{ marginTop: Spacing.xl, alignItems: "center" }}>
            <Pressable
              onPress={onGoLogin}
              accessibilityRole="button"
              accessibilityLabel="Back to login"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={[Typography.small, { color: Colors.secondary, fontWeight: "800" }]}>Back to Login</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
