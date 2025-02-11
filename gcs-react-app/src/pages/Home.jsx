import Launch from "../components/Launch";
import NewLaunch from "../components/NewLaunch";

import "../styles/Home.css";

export default function Home() {
    return (
        <main>
            <h1 className="recent-launches">Recent Launches</h1>
            <div class="launches-container">
                <NewLaunch />
                <Launch name="Spaceport Launch (Test)" />
                <Launch name="Spaceport Launch (Test)" />
                <Launch name="Spaceport Launch (Test)" />
                <Launch name="Spaceport Launch (Test)" />
                <Launch name="Spaceport Launch (Test)" />
                <Launch name="Spaceport Launch (Test)" />
            </div>
        </main>
    )
}