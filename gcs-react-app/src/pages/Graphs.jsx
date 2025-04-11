import Gauge from "./../components/Gauge";

export default function Graphs() {
    return (
        <div>
            <Gauge value={75} min={0} max={100} title="Tester Guage Graph" />
        </div>
    )
}