import React from "react";
import { Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import BottomNav from "../components/BottomNav";
import { Colors, Spacing, Typography } from "../theme";

export default function SavedPlansScreen({ onGoHome, onGoNewPlan, onGoSavedPlans }) {
  return (
    <Screen
      footer={
        <BottomNav
          activeTab="saved"
          onGoHome={onGoHome}
          onGoNewPlan={onGoNewPlan}
          onGoSavedPlans={onGoSavedPlans}
        />
      }
    >
      <View style={{ alignItems: "center" }}>
        <Text style={[Typography.h1, { color: Colors.text, textAlign: "center" }]}>Saved Plans</Text>
        <Text
          style={[
            Typography.body,
            { color: Colors.muted, marginTop: Spacing.sm, textAlign: "center" },
          ]}
        >
          View Saved Plan (coming soon)
        </Text>
      </View>

      <View style={{ marginTop: Spacing.xl }}>
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>No saved plans yet</Text>
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}>
            This is a placeholder. We’ll list your saved plans here.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
