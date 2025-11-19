import "../styles/BackButton.css";
import backArrow from '../assets/back-arrow.svg';
import {useNavigate}  from 'react-router-dom';

// this file only contains the back button to navigate to the chart page
// dont think this is needed

const BackButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chart');
  };

  return (
    <button className="Button" onClick={handleClick}>
      <img src={backArrow} alt="Back" />
      <h1>Back</h1>
    </button>
  );
}

export default BackButton;