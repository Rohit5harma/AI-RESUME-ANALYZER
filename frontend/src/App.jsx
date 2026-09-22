import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./LandingPage";
import Feature from "./Feature";
import Register from "./Register";
import Login from "./Login";
import NavBar from "./NavBar";
import AnalyticDashboard from "./AnalyticDashboard";
import Profile from "./Profile";
import DemoAnalysis from "./demoAnalysis";
import ATSAnalysis from "./ATSAnalysis";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar />
              <LandingPage />
            </>
          }
        />
        <Route path="/demo" element={<DemoAnalysis />} />
        <Route
          path="/Feature"
          element={
            <>
              <NavBar />
              <Feature />
            </>
          }
        />
        <Route
          path="/Login"
          element={
            <>
              <NavBar />
              <Login />
            </>
          }
        />
        <Route
          path="/Register"
          element={
            <>
              <NavBar />
              <Register />
            </>
          }
        />
        <Route path="/dashboard" element={<AnalyticDashboard />} />
        <Route path="/ats-analysis" element={<ATSAnalysis />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;