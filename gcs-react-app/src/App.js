import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Fetch from "./pages/Fetch";
import NavBar from "./components/NavBar";
import "./Global.css";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/fetch" element={<Fetch />} />
      </Routes>
    </Router>
  );
}

export default App;
