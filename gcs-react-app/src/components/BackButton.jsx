import "../styles/BackButton.css";
import backArrow from '../assets/back-arrow.svg';
import {useNavigate}  from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };

  return (
    <div className="button-container">
      <button className="Button" onClick={handleClick}>
        <img classname="arrow-button" src={backArrow} alt="Back" />
        <h1>Back</h1>
      </button>
    </div>
  );
}

export default BackButton;