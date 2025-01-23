import Launch from "../components/Launch";
import "../styles/Home.css";


export default function Home() {
    return (
        <main>
            <h1 className="recent-launches">Recent Launches</h1>
            <div class="launches-container">
                <Launch name="New Launch" />
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