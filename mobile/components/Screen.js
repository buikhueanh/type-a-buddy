import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { Colors, Spacing } from "../theme";

export default function Screen({ children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: Spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}