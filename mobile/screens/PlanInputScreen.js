import React, { useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Screen from "../components/Screen";
import Card from "../components/Card";
import TextField from "../components/TextField";
import Button from "../components/Button";
import BottomNav from "../components/BottomNav";
import { Colors, Spacing, Typography } from "../theme";

function formatLocalDate(value) {
  try {
    return value.toLocaleDateString();
  } catch {
    return "";
  }
}

function formatLocalTime(value) {
  try {
    return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function applyDatePart(prev, dateValue) {
  const d = new Date(prev);
  d.setFullYear(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
  return d;
}

function applyTimePart(prev, timeValue) {
  const d = new Date(prev);
  d.setHours(timeValue.getHours(), timeValue.getMinutes(), 0, 0);
  return d;
}

export default function PlanInputScreen({ onGoHome, onGoLoading, onGoNewPlan, onGoSavedPlans }) {
  const defaultDeadline = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(17, 0, 0, 0);
    return d;
  }, []);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [hoursPerDay, setHoursPerDay] = useState("2");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);
  const [pendingTime, setPendingTime] = useState(null);
  const [error, setError] = useState(null);

  function validate() {
    const trimmedGoal = goal.trim();
    if (!trimmedGoal) return "Goal is required";

    const hours = Number.parseFloat(hoursPerDay);
    if (!Number.isFinite(hours) || hours <= 0) return "Daily focus time must be greater than 0";

    if (!(deadline instanceof Date) || Number.isNaN(deadline.getTime())) return "Deadline is invalid";
    if (deadline.getTime() <= Date.now()) return "Deadline must be in the future";

    return null;
  }

  function onPickDate(event, selected) {
    if (event?.type === "dismissed") {
      setShowDatePicker(false);
      setPendingDate(null);
      return;
    }
    if (!selected) return;

    if (Platform.OS === "ios") {
      setPendingDate((prev) => applyDatePart(prev || deadline, selected));
      return;
    }

    setDeadline((prev) => applyDatePart(prev, selected));
    setShowDatePicker(false);
  }

  function confirmDate() {
    if (pendingDate) setDeadline(pendingDate);
    setPendingDate(null);
    setShowDatePicker(false);
  }

  function cancelDate() {
    setPendingDate(null);
    setShowDatePicker(false);
  }

  function onPickTime(event, selected) {
    if (event?.type === "dismissed") {
      setShowTimePicker(false);
      setPendingTime(null);
      return;
    }
    if (!selected) return;

    if (Platform.OS === "ios") {
      setPendingTime((prev) => applyTimePart(prev || deadline, selected));
      return;
    }

    setDeadline((prev) => applyTimePart(prev, selected));
    setShowTimePicker(false);
  }

  function confirmTime() {
    if (pendingTime) setDeadline(pendingTime);
    setPendingTime(null);
    setShowTimePicker(false);
  }

  function cancelTime() {
    setPendingTime(null);
    setShowTimePicker(false);
  }

  function onGenerate() {
    setError(null);

    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    const payload = {
      goal: goal.trim(),
      deadline_at: deadline.toISOString(),
      hours_available_per_day: Number.parseFloat(hoursPerDay),
    };

    if (onGoLoading) onGoLoading(payload);
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
        <Text style={[Typography.h1, { color: Colors.text, textAlign: "center" }]}>Create a Plan</Text>
      </View>

      <View style={{ marginTop: Spacing.xl }}>
        <Card>
          <TextField
            label="Goal"
            value={goal}
            onChangeText={setGoal}
            autoCapitalize="sentences"
            placeholder="e.g. Improve typing speed"
            multiline
            numberOfLines={3}
            inputStyle={{ minHeight: 96, textAlignVertical: "top" }}
          />

          <View style={{ marginTop: Spacing.xl }}>
            <Text style={[Typography.small, { color: Colors.muted, marginBottom: Spacing.sm }]}>Deadline</Text>

            <View style={{ flexDirection: "row", gap: Spacing.md }}>
              <Pressable
                onPress={() => {
                  setPendingDate(deadline);
                  setShowDatePicker(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Pick deadline date"
                style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}
              >
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderRadius: 14,
                    backgroundColor: Colors.bg,
                    padding: Spacing.md,
                  }}
                >
                  <Text style={[Typography.body, { color: Colors.text, fontWeight: "700" }]}>{formatLocalDate(deadline)}</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setPendingTime(deadline);
                  setShowTimePicker(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Pick deadline time"
                style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}
              >
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: Colors.border,
                    borderRadius: 14,
                    backgroundColor: Colors.bg,
                    padding: Spacing.md,
                  }}
                >
                  <Text style={[Typography.body, { color: Colors.text, fontWeight: "700" }]}>{formatLocalTime(deadline)}</Text>
                </View>
              </Pressable>
            </View>

            {showDatePicker ? (
              <View style={{ marginTop: Spacing.md }}>
                <DateTimePicker
                  value={Platform.OS === "ios" && pendingDate ? pendingDate : deadline}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  minimumDate={minDate}
                  onChange={onPickDate}
                />

                {Platform.OS === "ios" ? (
                  <View style={{ marginTop: Spacing.md, flexDirection: "row", justifyContent: "flex-end" }}>
                    <Pressable
                      onPress={cancelDate}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel date selection"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm })}
                    >
                      <Text style={[Typography.small, { color: Colors.muted, fontWeight: "800" }]}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={confirmDate}
                      accessibilityRole="button"
                      accessibilityLabel="Confirm date selection"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm })}
                    >
                      <Text style={[Typography.small, { color: Colors.secondary, fontWeight: "800" }]}>Confirm</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}

            {showTimePicker ? (
              <View style={{ marginTop: Spacing.md }}>
                <DateTimePicker
                  value={Platform.OS === "ios" && pendingTime ? pendingTime : deadline}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onPickTime}
                />

                {Platform.OS === "ios" ? (
                  <View style={{ marginTop: Spacing.md, flexDirection: "row", justifyContent: "flex-end" }}>
                    <Pressable
                      onPress={cancelTime}
                      accessibilityRole="button"
                      accessibilityLabel="Cancel time selection"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm })}
                    >
                      <Text style={[Typography.small, { color: Colors.muted, fontWeight: "800" }]}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={confirmTime}
                      accessibilityRole="button"
                      accessibilityLabel="Confirm time selection"
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm })}
                    >
                      <Text style={[Typography.small, { color: Colors.secondary, fontWeight: "800" }]}>Confirm</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>

          <TextField
            label="Daily Focus Time"
            value={hoursPerDay}
            onChangeText={setHoursPerDay}
            keyboardType="numeric"
            placeholder="Hours per day"
          />

          {error ? (
            <Text style={{ marginTop: Spacing.lg, color: Colors.danger }}>{error}</Text>
          ) : null}

          <View style={{ marginTop: Spacing.xl }}>
            <Button title="Generate Plan" onPress={onGenerate} leftDot />
          </View>

          <View style={{ marginTop: Spacing.xl, alignItems: "center" }}>
            <Pressable
              onPress={onGoHome}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={[Typography.small, { color: Colors.secondary, fontWeight: "800" }]}>Back</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
