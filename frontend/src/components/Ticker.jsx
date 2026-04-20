/* Abhishek Singh */
import React from 'react';
import './Ticker.css';

const Ticker = () => {
  const messages = [
    "ACME AIRLINES",
    "THE BEST WAY TO FLY",
    "ECONOMIC, LUXURIOUS, FAST",
    "ENJOY GREAT BENEFITS WITH OUR LOYALTY PROGRAM",
    "COMING SOON TO YOUR CITY. IF WE'RE NOT ALREADY THERE",
    "BOOK NOW FOR SUMMER 2026"
];

return (
  <div className="ticker-container">
    <div className="ticker-scroll">
      {/* Loop */}
      {[...messages, ...messages].map((text, index) => (
        <div key={index} className="ticker-item">
          {text}
          <span className="ticker-divider">•</span>
        </div>
      ))}
    </div>
  </div>
);
};

export default Ticker