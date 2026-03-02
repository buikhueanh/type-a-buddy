import React from "react";
import { SafeAreaView } from "react-native";
import { Colors, Spacing } from "../theme";

export default function Screen({ children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background, padding: Spacing.lg }}>
      {children}
    </SafeAreaView>
  );
}