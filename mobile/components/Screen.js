import React from "react";
import { SafeAreaView, View } from "react-native";
import { Colors, Spacing } from "../theme";

export default function Screen({ children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ flex: 1, padding: Spacing.xl }}>{children}</View>
    </SafeAreaView>
  );
}