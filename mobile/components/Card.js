import React from "react";
import { View } from "react-native";
import { Colors, Spacing, Radii } from "../theme";

export default function Card({ children }) {
  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: Radii.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
      }}
    >
      {children}
    </View>
  );
}