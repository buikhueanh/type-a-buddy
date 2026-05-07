import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Screen from "../components/Screen";
import Card from "../components/Card";
import BottomNav from "../components/BottomNav";
import { deleteSavedPlan, getSavedPlans } from "../lib/api";
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

export default function SavedPlansScreen({ authToken, onGoHome, onGoNewPlan, onGoSavedPlans, onOpenPlan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plans, setPlans] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const signedIn = Boolean(authToken);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);

      if (!signedIn) {
        setPlans([]);
        return;
      }

      try {
        setLoading(true);
        const res = await getSavedPlans(authToken);
        if (cancelled) return;
        setPlans(Array.isArray(res) ? res : []);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || "Failed to load saved plans");
        setPlans([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authToken, signedIn]);

  const content = useMemo(() => {
    if (!signedIn) {
      return (
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>Sign in required</Text>
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}
          >
            Sign in to view your saved plans.
          </Text>
        </Card>
      );
    }

    if (loading) {
      return (
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>Loading…</Text>
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}
          >
            Fetching your saved plans.
          </Text>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>Couldn’t load plans</Text>
          <Text style={[Typography.body, { color: Colors.danger, marginTop: Spacing.sm }]}>
            {error}
          </Text>
        </Card>
      );
    }

    if (!plans.length) {
      return (
        <Card>
          <Text style={[Typography.h2, { color: Colors.text }]}>No saved plans yet</Text>
          <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}
          >
            Generate a plan and tap “Save Plan” to see it here.
          </Text>
        </Card>
      );
    }

    return (
      <View>
        {plans.map((p, idx) => {
          const title = String(p?.goalSummary || p?.goal || "Untitled plan");
          const created = formatDateTime(p?.createdAt);
          const deadline = formatDateTime(p?.deadlineAt);
          const planId = p?.planId ? String(p.planId) : null;

          function confirmDelete() {
            if (!signedIn || !planId) return;
            if (deletingId) return;

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
                      setDeletingId(planId);
                      await deleteSavedPlan(planId, authToken);
                      setPlans((prev) => (Array.isArray(prev) ? prev.filter((x) => String(x?.planId) !== planId) : []));
                    } catch (e) {
                      setError(e?.message || "Delete failed");
                    } finally {
                      setDeletingId(null);
                    }
                  },
                },
              ]
            );
          }

          return (
            <View key={p?.planId ? String(p.planId) : `row-${idx}`} style={{ marginTop: idx ? Spacing.lg : 0 }}>
              <Card>
                <Pressable
                  onPress={() => {
                    if (typeof onOpenPlan === "function" && planId) onOpenPlan(planId);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Open saved plan"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <Text style={[Typography.h2, { color: Colors.text }]}>{title}</Text>

                  {created ? (
                    <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm }]}>
                      Saved: {created}
                    </Text>
                  ) : null}

                  {deadline ? (
                    <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.xs }]}>
                      Deadline: {deadline}
                    </Text>
                  ) : null}
                </Pressable>

                <View style={{ marginTop: Spacing.lg }}>
                  <Pressable
                    onPress={confirmDelete}
                    accessibilityRole="button"
                    accessibilityLabel="Delete saved plan"
                    style={({ pressed }) => ({ opacity: pressed || deletingId === planId ? 0.7 : 1 })}
                  >
                    <Text style={[Typography.body, { color: Colors.danger, fontWeight: "900" }]}>
                      {deletingId === planId ? "Deleting…" : "Delete"}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            </View>
          );
        })}
      </View>
    );
  }, [signedIn, loading, error, plans, deletingId, authToken, onOpenPlan]);

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
        <Text style={[Typography.body, { color: Colors.muted, marginTop: Spacing.sm, textAlign: "center" }]}>
          Your saved plans, newest first.
        </Text>
      </View>

      <View style={{ marginTop: Spacing.xl }}>
        {content}
      </View>
    </Screen>
  );
}
