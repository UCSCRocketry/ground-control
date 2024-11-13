import BackButton from "./../components/BackButton";
import HomeButton from "./../components/HomeButton";

export default function NavBar() {
    return (
        <h1 id="nav">
            <img src="/GroundControlLogo.png" alt="Logo" />
            <HomeButton />
            <BackButton />
        </h1>
    )
}