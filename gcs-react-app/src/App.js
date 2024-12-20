import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import NavBar from "./components/NavBar";
import "./Global.css";

function App() {
  return (
    <Router>
        <header>
          <NavBar></NavBar>
        </header>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home page when the URL is */}
        <Route path="/about" element={<About />} /> {/* About page when the URL is /about */}
        
        {/*WRITE OTHER ROUTES HERE */}

      </Routes>
    </Router>
  );
}

export default App;
