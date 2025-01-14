import "../styles/BackButton.css";
import backArrow from '../assets/back-arrow.svg';

const BackButton = () => {
  return (
    <div className="Button">
        <img src={backArrow} alt="Back" />
        <h1>Back</h1>
    </div>
  );
}

export default BackButton;