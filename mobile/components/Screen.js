import React from "react";
import { SafeAreaView, ScrollView, View } from "react-native";
import { Colors, Spacing } from "../theme";

export default function Screen({ children, footer }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: Spacing.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {footer ? <View>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}