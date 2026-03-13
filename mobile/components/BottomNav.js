import React from "react";
import { Pressable, Text, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../theme";

export default function BottomNav({ activeTab, onGoHome, onGoSavedPlans }) {
  const isHome = activeTab === "home";
  const isSaved = activeTab === "saved";
  const safeGoSaved = typeof onGoSavedPlans === "function" ? onGoSavedPlans : () => {};

  return (
    <View style={{ paddingHorizontal: Spacing.xl, paddingBottom: Spacing.lg, backgroundColor: Colors.bg }}>
      <View style={{ position: "relative" }}>
        <View
          style={{
            height: 66,
            backgroundColor: Colors.surface,
            borderRadius: Radii.xl,
            borderWidth: 1,
            borderColor: Colors.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            paddingHorizontal: Spacing.lg,
          }}
        >
          <Pressable
            onPress={onGoHome}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
            style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
          >
            <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md }}>
              <Text
                style={[
                  Typography.h1,
                  {
                    color: isHome ? Colors.primary : Colors.muted,
                    fontWeight: "900",
                    lineHeight: 30,
                  },
                ]}
              >
                ⌂
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={safeGoSaved}
            accessibilityRole="button"
            accessibilityLabel="View saved plans"
            style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
          >
            <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.md }}>
              <Text
                style={[
                  Typography.small,
                  {
                    color: isSaved ? Colors.primary : Colors.muted,
                    fontWeight: "900",
                  },
                ]}
              >
                Saved Plan
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
