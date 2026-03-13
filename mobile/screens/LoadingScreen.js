import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Screen from "../components/Screen";
import { generatePlan } from "../lib/api";
import { Colors, Spacing, Typography } from "../theme";

export default function LoadingScreen({ payload, onDone, onBack }) {
  const [error, setError] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(
    () => ["Analyzing your goal", "Planning your schedule", "Organizing tasks"],
    []
  );

  useEffect(() => {
    let cancelled = false;

    const intervalId = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 900);

    async function run() {
      setError(null);
      if (!payload) return;

      try {
        const plan = await generatePlan(payload);
        if (!cancelled && onDone) onDone(plan);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Plan generation failed");
      }
    }

    run();

    return () => {
      clearInterval(intervalId);
      cancelled = true;
    };
  }, [payload, onDone, steps.length]);

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[Typography.h2, { color: Colors.text, marginTop: Spacing.lg }]}>Generating your plan...</Text>

        <View style={{ marginTop: Spacing.xl, alignSelf: "stretch" }}>
          {steps.map((label, idx) => {
            const active = idx === stepIndex;
            return (
              <Text
                key={label}
                style={[
                  Typography.body,
                  {
                    color: active ? Colors.text : Colors.muted,
                    textAlign: "center",
                    marginTop: idx === 0 ? 0 : Spacing.sm,
                    fontWeight: active ? "800" : "600",
                  },
                ]}
              >
                {label}
              </Text>
            );
          })}
        </View>

        {error ? (
          <View style={{ marginTop: Spacing.xl, alignItems: "center" }}>
            <Text style={[Typography.body, { color: Colors.danger, textAlign: "center" }]}>{error}</Text>
            <View style={{ marginTop: Spacing.lg }}>
              <Pressable
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel="Back"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={[Typography.small, { color: Colors.secondary, fontWeight: "800" }]}>Back</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
