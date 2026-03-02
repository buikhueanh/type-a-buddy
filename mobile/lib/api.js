// mobile/lib/api.js
import { API_BASE_URL } from "../constants/config";

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (data && data.detail && typeof data.detail === "string" && data.detail) ||
      "Request failed";
    throw new Error(message);
  }

  return data;
}

export function register(email, password) {
  return request("/auth/register", { method: "POST", body: { email, password } });
}

export function login(email, password) {
  return request("/auth/login", { method: "POST", body: { email, password } });
}