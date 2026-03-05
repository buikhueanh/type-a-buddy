// mobile/App.js
import React, { useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";

export default function App() {
  const [screen, setScreen] = useState("login");

  if (screen === "signup") {
    return <SignupScreen onGoLogin={() => setScreen("login")} />;
  }
  if (screen === "forgot") {
    return <ForgotPasswordScreen onGoLogin={() => setScreen("login")} />;
  }
  return (
    <LoginScreen
      onGoSignup={() => setScreen("signup")}
      onGoForgotPassword={() => setScreen("forgot")}
    />
  );
}