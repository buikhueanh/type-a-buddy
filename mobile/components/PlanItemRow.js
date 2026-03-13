import React from "react";
import { Text, View } from "react-native";
import { Colors, Spacing, Typography } from "../theme";

function formatHours(value) {
  if (!Number.isFinite(value)) return "";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}h`;
}

export default function PlanItemRow({ index, title, durationHours }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: Spacing.sm,
      }}
    >
      <Text
        style={[
          Typography.body,
          {
            color: Colors.muted,
            fontWeight: "800",
            marginRight: Spacing.sm,
            width: 24,
            textAlign: "right",
          },
        ]}
      >
        {typeof index === "number" ? `${index + 1}.` : ""}
      </Text>
      <Text
        style={[
          Typography.body,
          {
            color: Colors.text,
            fontWeight: "700",
            flex: 1,
            flexShrink: 1,
            flexWrap: "wrap",
          },
        ]}
      >
        {title}
        {Number.isFinite(durationHours) ? ` (${formatHours(durationHours)})` : ""}
      </Text>
    </View>
  );
}
