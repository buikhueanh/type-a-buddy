import React from "react";
import { View, Pressable } from "react-native";
import { Colors, Spacing } from "../theme";
import { Body, Muted } from "./TextBlock";

export default function TaskItem({ task, onDelete }) {
  return (
    <View style={{ paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
      <Body style={{ fontWeight: "600" }}>{task.title}</Body>
      {task.notes ? <Muted style={{ marginTop: Spacing.xs }}>{task.notes}</Muted> : null}

      <Pressable onPress={() => onDelete(task.id)} style={{ marginTop: Spacing.sm }}>
        <Muted style={{ color: Colors.danger }}>Delete</Muted>
      </Pressable>
    </View>
  );
}