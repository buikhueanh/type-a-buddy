import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import Screen from "../components/Screen";
import TaskItem from "../components/TaskItem";
import { Title, Body, Muted } from "../components/TextBlock";
import { fetchTasks, deleteTask } from "../lib/api";
import { Colors, Spacing } from "../theme";

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setError(null);
    const data = await fetchTasks();
    setTasks(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await load();
    } catch (e) {
      setError(e.message || "Unknown error");
    } finally {
      setRefreshing(false);
    }
  }

  async function onDelete(id) {
    try {
      await deleteTask(id);
      await load();
    } catch (e) {
      setError(e.message || "Unknown error");
    }
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator />
        <Body style={{ marginTop: Spacing.md }}>Loading tasks...</Body>
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>Tasks</Title>

      {error ? (
        <View
          style={{
            marginTop: Spacing.md,
            padding: Spacing.md,
            backgroundColor: Colors.surface,
            borderRadius: 8,
          }}
        >
          <Body style={{ fontWeight: "700" }}>Error</Body>
          <Muted style={{ marginTop: Spacing.sm }}>{error}</Muted>
        </View>
      ) : null}

      <FlatList
        style={{ marginTop: Spacing.md }}
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Muted style={{ marginTop: Spacing.md }}>
            No tasks yet. Create some with curl.
          </Muted>
        }
        renderItem={({ item }) => <TaskItem task={item} onDelete={onDelete} />}
      />
    </Screen>
  );
}
