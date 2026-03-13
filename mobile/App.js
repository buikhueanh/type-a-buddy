// mobile/App.js
import React, { useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import PlanInputScreen from "./screens/PlanInputScreen";
import LoadingScreen from "./screens/LoadingScreen";
import PlanResultScreen from "./screens/PlanResultScreen";
import SavedPlansScreen from "./screens/SavedPlansScreen";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [planningPayload, setPlanningPayload] = useState(null);
  const [planResult, setPlanResult] = useState(null);

  function goHome() {
    setScreen("home");
  }

  function goNewPlan() {
    setScreen("planInput");
  }

  function goSavedPlans() {
    setScreen("savedPlans");
  }

  if (screen === "home") {
    return (
      <HomeScreen
        onCreateNewPlan={goNewPlan}
        onGoHome={goHome}
        onGoNewPlan={goNewPlan}
        onGoSavedPlans={goSavedPlans}
      />
    );
  }
  if (screen === "planInput") {
    return (
      <PlanInputScreen
        onGoHome={goHome}
        onGoNewPlan={goNewPlan}
        onGoSavedPlans={goSavedPlans}
        onGoLoading={(payload) => {
          setPlanningPayload(payload);
          setScreen("loading");
        }}
      />
    );
  }
  if (screen === "loading") {
    return (
      <LoadingScreen
        payload={planningPayload}
        onDone={(plan) => {
          setPlanResult(plan);
          setScreen("planResult");
        }}
        onBack={() => setScreen("planInput")}
      />
    );
  }
  if (screen === "planResult") {
    return (
      <PlanResultScreen
        plan={planResult}
        onGoHome={goHome}
        onGoNewPlan={goNewPlan}
        onGoSavedPlans={goSavedPlans}
      />
    );
  }
  if (screen === "savedPlans") {
    return (
      <SavedPlansScreen
        onGoHome={goHome}
        onGoNewPlan={goNewPlan}
        onGoSavedPlans={goSavedPlans}
      />
    );
  }
  if (screen === "signup") {
    return (
      <SignupScreen
        onGoLogin={() => setScreen("login")}
        onGoHome={() => setScreen("home")}
      />
    );
  }
  if (screen === "forgot") {
    return <ForgotPasswordScreen onGoLogin={() => setScreen("login")} />;
  }
  return (
    <LoginScreen
      onGoSignup={() => setScreen("signup")}
      onGoForgotPassword={() => setScreen("forgot")}
      onGoHome={() => setScreen("home")}
    />
  );
}