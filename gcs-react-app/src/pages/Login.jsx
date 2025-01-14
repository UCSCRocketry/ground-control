import RocketLogo from "./../assets/RocketEmblem.png";
import "../styles/Login.css";

export default function Home() {
    return (
        <div>
            <div className="center">
                <img src={RocketLogo} width="50%" alt="rocket team logo"/>
                <input type="text" id="username" name="username" placeholder="GROUND CONTROL SYSTEM MEBER LOGIN USERNAME"/>
                <input type="password" id="password" name="password" placeholder="Password"/>
                <a href="/"><h6 className="forgot-password">Forgot Password?</h6></a>
            </div>
        </div>
    )
}

//<p>Welcome to the login page!</p>
//<HomeButton />
//<BackButton />