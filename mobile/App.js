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
import SavedPlanDetailScreen from "./screens/SavedPlanDetailScreen";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [authToken, setAuthToken] = useState(null);
  const [planningPayload, setPlanningPayload] = useState(null);
  const [planResult, setPlanResult] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  function goHome() {
    setScreen("home");
  }

  function goNewPlan() {
    setScreen("planInput");
  }

  function goSavedPlans() {
    setScreen("savedPlans");
  }

  function goSavedPlanDetail(planId) {
    setSelectedPlanId(planId);
    setScreen("savedPlanDetail");
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
        goal={planningPayload?.goal}
        authToken={authToken}
        onGoHome={goHome}
        onGoNewPlan={goNewPlan}
        onGoSavedPlans={goSavedPlans}
      />
    );
  }
  if (screen === "savedPlans") {
    return (
      <SavedPlansScreen
        authToken={authToken}
        onGoHome={goHome}
        onGoNewPlan={goNewPlan}
        onGoSavedPlans={goSavedPlans}
        onOpenPlan={goSavedPlanDetail}
      />
    );
  }
  if (screen === "savedPlanDetail") {
    return (
      <SavedPlanDetailScreen
        planId={selectedPlanId}
        authToken={authToken}
        onGoHome={goHome}
        onGoSavedPlans={goSavedPlans}
      />
    );
  }
  if (screen === "signup") {
    return (
      <SignupScreen
        onGoLogin={() => setScreen("login")}
        onSignedIn={(token) => {
          setAuthToken(token);
          setScreen("home");
        }}
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
      onSignedIn={(token) => {
        setAuthToken(token);
        setScreen("home");
      }}
    />
  );
}