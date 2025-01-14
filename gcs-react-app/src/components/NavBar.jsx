import BackButton from "./../components/BackButton";
import HomeButton from "./../components/HomeButton";

export default function NavBar() {
    return (
        <nav id="nav">
            <HomeButton />
            <img src="/GroundControlLogo.png" alt="Logo" />
            <BackButton />
        </nav>
    )
}