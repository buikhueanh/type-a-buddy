import React from "react";
import { Pressable, Text, View } from "react-native";
import { Colors, Spacing, Radii, Typography } from "../theme";

export default function Button({ title, onPress, variant = "primary", leftDot = false }) {
  const bg =
    variant === "primary" ? Colors.primary :
    variant === "secondary" ? Colors.secondary :
    Colors.surface;

  const textColor = variant === "ghost" ? Colors.text : "#111111";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: bg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: Radii.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        {leftDot ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: Colors.highlight,
              marginRight: Spacing.sm,
            }}
          />
        ) : null}
        <Text style={[Typography.body, { color: textColor, fontWeight: "800" }]}>{title}</Text>
      </View>
    </Pressable>
  );
}