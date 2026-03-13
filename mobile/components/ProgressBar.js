import React from "react";
import { View } from "react-native";
import { Colors, Radii } from "../theme";

export default function ProgressBar({ value = 0, max = 1 }) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const safeValue = Number.isFinite(value) ? value : 0;
  const pct = Math.max(0, Math.min(1, safeValue / safeMax));

  return (
    <View
      style={{
        height: 10,
        backgroundColor: Colors.border,
        borderRadius: Radii.lg,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${pct * 100}%`,
          backgroundColor: Colors.primary,
        }}
      />
    </View>
  );
}
