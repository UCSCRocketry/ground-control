import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login"
import Fetch from "./pages/Fetch";
import Launch from "./pages/LaunchPage";
import NavBar from "./components/NavBar";
import Chart from "./pages/TEST_Chart";
import "./Global.css";
import GraphsToBackend from "./pages/TEST_GraphsToBackend";

function App() {
  return (
    <Router>
        <header>
          <NavBar></NavBar>
        </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/fetch" element={<Fetch />} />
        <Route path="/chart" element={<Chart />} />
        <Route path="/launch" element={<Launch />} />
        <Route path="/graphsBack" element={<GraphsToBackend />} />


          {/*WRITE OTHER ROUTES HERE */}

      </Routes>
    </Router>
  );
}

export default App;