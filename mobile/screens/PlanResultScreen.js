import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import DayCard from "../components/DayCard";
import Button from "../components/Button";
import BottomNav from "../components/BottomNav";
import { savePlan } from "../lib/api";
import { Colors, Spacing, Typography } from "../theme";

export default function PlanResultScreen({ plan, goal, authToken, onGoHome, onGoNewPlan, onGoSavedPlans }) {
  const safePlan = plan || {};
  const days = Array.isArray(safePlan.days) ? safePlan.days : [];
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function onSave() {
    if (saving) return;

    setError(null);
    setStatus(null);

    if (!authToken) {
      setError("Sign in to save plans.");
      return;
    }

    const goalToSave = String(goal || safePlan.goal_summary || "").trim();
    if (!goalToSave) {
      setError("Missing goal. Please generate the plan again.");
      return;
    }

    try {
      setSaving(true);
      const res = await savePlan({ goal: goalToSave, generatedPlan: safePlan }, authToken);
      const planId = res?.planId ? String(res.planId) : null;
      setStatus(planId ? `Saved (id: ${planId})` : "Saved");
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

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

          <View style={{ marginTop: Spacing.xl, opacity: saving ? 0.75 : 1 }}>
            <Button title={saving ? "Saving..." : "Save Plan"} onPress={onSave} />
          </View>

          {status ? (
            <Text style={{ marginTop: Spacing.lg, color: Colors.success }}>{status}</Text>
          ) : null}
          {error ? (
            <Text style={{ marginTop: Spacing.lg, color: Colors.danger }}>{error}</Text>
          ) : null}
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
