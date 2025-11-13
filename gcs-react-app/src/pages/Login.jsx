import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RocketLogo from "./../assets/RocketEmblem.png";
import "../styles/Login.css";
import "../styles/NavBar.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "ucscrocketry" && password === "slugs") {
      navigate("/Home");
    } else {
      alert("Invalid username or password");
    }
  };

  return (
    <div>
      <div className="center">
        <img src={RocketLogo} width="50%" alt="rocket team logo" />
        <form onSubmit={handleLogin}>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GROUND CONTROL SYSTEM MEMBER LOGIN USERNAME"
          />
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <a href="/">
            <h6 className="forgot-password">Forgot Password?</h6>
          </a>
          <button type="submit" className="login-button">
            LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}
