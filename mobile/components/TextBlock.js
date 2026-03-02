import React from "react";
import { Text } from "react-native";
import { Colors, Typography } from "../theme";

export function Title({ children, style }) {
  return <Text style={[Typography.title, { color: Colors.text }, style]}>{children}</Text>;
}

export function Body({ children, style }) {
  return <Text style={[Typography.body, { color: Colors.text }, style]}>{children}</Text>;
}

export function Muted({ children, style }) {
  return <Text style={[Typography.body, { color: Colors.mutedText }, style]}>{children}</Text>;
}