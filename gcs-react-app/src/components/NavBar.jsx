import BackButton from "./../components/BackButton";
import HomeButton from "./../components/HomeButton";
import "../styles/NavBar.css";
 

export default function NavBar() {
    return (
        <nav id="nav">           
            <HomeButton />
            <img id="logo" src="/GroundControlLogo.png" alt="Logo" />
            <BackButton />
        </nav>
    )
}