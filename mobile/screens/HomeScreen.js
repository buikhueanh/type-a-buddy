import React from "react";
import { Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import Button from "../components/Button";
import BottomNav from "../components/BottomNav";
import { Colors, Spacing, Typography } from "../theme";

export default function HomeScreen({ onCreateNewPlan, onGoHome, onGoNewPlan, onGoSavedPlans }) {
  return (
    <Screen
      footer={
        <BottomNav
          activeTab="home"
          onGoHome={onGoHome}
          onGoNewPlan={onGoNewPlan}
          onGoSavedPlans={onGoSavedPlans}
        />
      }
    >
      <View style={{ alignItems: "center" }}>
        <Text style={[Typography.h1, { color: Colors.text }]}>
          Welcome back
        </Text>
        <Text
          style={[
            Typography.body,
            { color: Colors.muted, marginTop: Spacing.sm, textAlign: "center" },
          ]}
        >
          Start planning your next goal.
        </Text>
      </View>

      <View style={{ marginTop: Spacing.xl }}>
        <Button title="Create New Plan" onPress={onCreateNewPlan} leftDot />
      </View>
    </Screen>
  );
}
