import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Colors, Spacing, Radii, Typography } from "../theme";

export default function TextField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = "none",
  rightLabel,
  onRightPress,
  rightA11yLabel,
}) {
  return (
    <View style={{ marginTop: Spacing.lg }}>
      <Text style={[Typography.small, { color: Colors.muted, marginBottom: Spacing.sm }]}>
        {label}
      </Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: Radii.lg,
          backgroundColor: Colors.bg,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            padding: Spacing.md,
            color: Colors.text,
          }}
        />

        {rightLabel && onRightPress ? (
          <Pressable
            onPress={onRightPress}
            accessibilityRole="button"
            accessibilityLabel={rightA11yLabel || rightLabel}
            style={({ pressed }) => ({
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.md,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={[Typography.small, { color: Colors.muted, fontWeight: "800" }]}>
              {rightLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}