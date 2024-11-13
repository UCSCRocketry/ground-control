import BackButton from "./../components/BackButton";
import HomeButton from "./../components/HomeButton";
import RocketLogo from "./../assets/RocketEmblem.png";
import "../styles/Login.css";

export default function Home() {
    return (
        <div>
            <div className="center">
                <img src={RocketLogo} width="50%"/>
                <input type="text" id="username" name="username"/>
                <input type="password" id="password" name="password"/>
                <h6>Forgot Password?</h6>
            </div>
        </div>
    )
}

//<p>Welcome to the login page!</p>
//<HomeButton />
//<BackButton />