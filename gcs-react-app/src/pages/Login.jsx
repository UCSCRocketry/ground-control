import BackButton from "./../components/BackButton";
import HomeButton from "./../components/HomeButton";
import RocketLogo from "./../assets/RocketEmblem.png";

export default function Home() {
    return (
        <div>
            <img src={RocketLogo} />
            <h1>Login</h1>
            <p>Welcome to the login page!</p>
            <HomeButton />
            <BackButton />
        </div>
    )
}