// mobile/App.js
import React, { useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

export default function App() {
  const [screen, setScreen] = useState("login");

  if (screen === "signup") {
    return <SignupScreen onGoLogin={() => setScreen("login")} />;
  }
  return <LoginScreen onGoSignup={() => setScreen("signup")} />;
}