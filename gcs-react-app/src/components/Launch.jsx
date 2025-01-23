import "../styles/Launch.css";

export default function Launch({ name }) {
    return (
        <div className="launch-container">
            <main id="launch">
                <h1>{ name }</h1>
            </main>
            <div className="info-row">
                <p className="date">11:49pm 1/22/25</p>
                <p className="edit">...</p>
            </div>
        </div>
    )
}