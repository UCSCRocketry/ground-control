import Launch from "../components/Launch"

export default function Home() {
    return (
        <main>
            <h1>Recent Launches</h1>
            <div class="launches-container">
                <Launch name="New Launch" />
                <Launch name="Spaceport Launch (Test)" />
            </div>
        </main>
    )
}