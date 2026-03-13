import React, { useMemo } from "react";
import { Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import DayCard from "../components/DayCard";
import BottomNav from "../components/BottomNav";
import { Colors, Spacing, Typography } from "../theme";

export default function PlanResultScreen({ plan, onGoHome, onGoNewPlan, onGoSavedPlans }) {
  const safePlan = plan || {};
  const days = Array.isArray(safePlan.days) ? safePlan.days : [];

  return (
    <Screen
      footer={
        <BottomNav
          activeTab="newPlan"
          onGoHome={onGoHome}
          onGoNewPlan={onGoNewPlan}
          onGoSavedPlans={onGoSavedPlans}
        />
      }
    >
      <View style={{ alignItems: "center" }}>
        <Text style={[Typography.h1, { color: Colors.text, textAlign: "center" }]}>Your Plan</Text>
      </View>

      <View style={{ marginTop: Spacing.xl }}>
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>Goal Summary</Text>
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}>
            {safePlan.goal_summary || ""}
          </Text>

          <Text style={[Typography.body, { color: Colors.text, marginTop: Spacing.lg, fontWeight: "800" }]}
          >
            Daily Focus Time: {safePlan.hours_available_per_day} hours
          </Text>
        </Card>
      </View>

      <View style={{ marginTop: Spacing.lg }}>
        {days.map((day, idx) => (
          <DayCard key={`${day.date}-${idx}`} date={day.date} items={day.items} />
        ))}
      </View>
    </Screen>
  );
}
