import React from "react";
import { Text, View } from "react-native";
import Card from "./Card";
import PlanItemRow from "./PlanItemRow";
import { Colors, Spacing, Typography } from "../theme";

function formatDayLabel(dateStr) {
  try {
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/;
    let d;
    if (typeof dateStr === "string" && isoDateOnly.test(dateStr)) {
      const [y, m, day] = dateStr.split("-").map((v) => Number.parseInt(v, 10));
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateStr);
    }
    if (Number.isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString(undefined, { month: "long", day: "numeric" });
  } catch {
    return String(dateStr);
  }
}

export default function DayCard({ date, items }) {
  return (
    <View style={{ marginTop: Spacing.lg }}>
      <Card>
        <Text style={[Typography.h2, { color: Colors.text }]}>{formatDayLabel(date)}</Text>

        <View style={{ marginTop: Spacing.md }}>
          {(items || []).map((item, idx) => (
            <PlanItemRow
              key={`${item.title}-${idx}`}
              index={idx}
              title={item.title}
              durationHours={item.duration_hours}
            />
          ))}
        </View>
      </Card>
    </View>
  );
}
