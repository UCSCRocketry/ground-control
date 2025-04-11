import "../styles/BackButton.css";
import backArrow from '../assets/back-arrow.svg';
import {useNavigate}  from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div className="button-container">
      <button className="Button" onClick={handleClick}>
        <img src={backArrow} alt="Back" />
        <h1 className="return-h1">Home</h1>
      </button>
    </div>
  );
}

export default BackButton;