import "../styles/BackButton.css";
import backArrow from '../assets/back-arrow.svg';

const HomeButton = () => {
  return (
    <div className="Button">
        <img src={backArrow} alt="Back" />
        <h1>Home</h1>
    </div>
  );
}

export default HomeButton;