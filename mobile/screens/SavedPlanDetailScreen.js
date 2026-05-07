import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import DayCard from "../components/DayCard";
import BottomNav from "../components/BottomNav";
import Button from "../components/Button";
import { deleteSavedPlan, getSavedPlan } from "../lib/api";
import { Colors, Spacing, Typography } from "../theme";

function formatDateTime(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

export default function SavedPlanDetailScreen({ planId, authToken, onGoHome, onGoSavedPlans }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const signedIn = Boolean(authToken);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);

      if (!signedIn || !planId) {
        setPlan(null);
        return;
      }

      try {
        setLoading(true);
        const res = await getSavedPlan(planId, authToken);
        if (cancelled) return;
        setPlan(res || null);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Failed to load saved plan");
        setPlan(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authToken, signedIn, planId]);

  function confirmDelete() {
    if (!signedIn) return;
    if (!planId || deleting) return;

    Alert.alert(
      "Delete this plan?",
      "Are you sure you want to delete this plan? This can’t be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteSavedPlan(planId, authToken);
              if (typeof onGoSavedPlans === "function") onGoSavedPlans();
            } catch (e) {
              setError(e?.message || "Delete failed");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  const generated = plan?.generatedPlan || null;
  const days = Array.isArray(generated?.days) ? generated.days : [];

  const headerCard = useMemo(() => {
    if (!signedIn) {
      return (
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>Sign in required</Text>
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}>
            Sign in to view your saved plan.
          </Text>
        </Card>
      );
    }

    if (loading) {
      return (
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>Loading…</Text>
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}>Fetching plan details.</Text>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>Couldn’t load plan</Text>
          <Text style={[Typography.body, { color: Colors.danger, marginTop: Spacing.sm }]}>{error}</Text>
        </Card>
      );
    }

    if (!plan) {
      return (
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>Plan not found</Text>
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}>It may have been deleted.</Text>
        </Card>
      );
    }

    const savedOn = formatDateTime(plan?.createdAt);
    const deadline = formatDateTime(plan?.deadlineAt);
    const goalText = String(plan?.goal || generated?.goal_summary || "").trim();

    return (
      <Card>
        <Text style={[Typography.h2, { color: Colors.text }]}>Overview</Text>

        {goalText ? (
          <Text style={[Typography.body, { color: Colors.text, marginTop: Spacing.sm }]}>
            Goal: {goalText}
          </Text>
        ) : null}

        {savedOn ? (
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}>Saved on: {savedOn}</Text>
        ) : null}

        {deadline ? (
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.xs }]}>Deadline: {deadline}</Text>
        ) : null}

        <View style={{ marginTop: Spacing.lg }}>
          <Pressable
            onPress={confirmDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete saved plan"
            style={({ pressed }) => ({ opacity: pressed || deleting ? 0.7 : 1 })}
          >
            <Text style={[Typography.body, { color: Colors.danger, fontWeight: "900" }]}>
              {deleting ? "Deleting…" : "Delete"}
            </Text>
          </Pressable>
        </View>
      </Card>
    );
  }, [signedIn, loading, error, plan, generated, deleting, planId]);

  return (
    <Screen
      footer={
        <BottomNav activeTab="saved" onGoHome={onGoHome} onGoSavedPlans={onGoSavedPlans} />
      }
    >
      <View style={{ alignItems: "center" }}>
        <Text style={[Typography.h1, { color: Colors.text, textAlign: "center" }]}>Saved Plan</Text>
        <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm, textAlign: "center" }]}
        >
          Saved on / deadline / goal
        </Text>
      </View>

      <View style={{ marginTop: Spacing.lg }}>
        <Button title="Back to Saved Plans" variant="ghost" onPress={onGoSavedPlans} />
      </View>

      <View style={{ marginTop: Spacing.lg }}>{headerCard}</View>

      {signedIn && !loading && !error && generated ? (
        <View style={{ marginTop: Spacing.lg }}>
          {days.map((day, idx) => (
            <DayCard key={`${day.date}-${idx}`} date={day.date} items={day.items} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
