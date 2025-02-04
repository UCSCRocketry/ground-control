import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login"
import Fetch from "./pages/Fetch";
import DataTable from "./pages/DataTable";
import NavBar from "./components/NavBar";
import "./Global.css";

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
        <Route path="/dataTable" element={<DataTable />} />

        
          {/*WRITE OTHER ROUTES HERE */}

      </Routes>
    </Router>
  );
}

export default App;
