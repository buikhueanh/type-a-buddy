import { API_BASE_URL } from "../constants/config";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${options.method || "GET"} ${path} failed: ${res.status} ${text}`);
  }

  if (res.status === 204) return null;
  return await res.json();
}

export function fetchTasks() {
  return request("/tasks");
}

export function createTask({ title, notes }) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify({ title, notes }),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}