/* Abhishek Singh */
import React from "react";
import './HomeHero.css';

const HomeHero = ({ isLoggedIn, onSignUpClick }) => {
    return (
        <div className="hero-container">
            <div className="text-content" style={{ zIndex: 10, position: 'relative' }}>
                <h1 className="hero-subtitle">
                    Fly Acme Airlines
                </h1>
                <p className="hero-subtile">
                    Economical, Luxurious, Fast.
                </p>
                {!isLoggedIn ? (
                    <button 
                        onClick={onSignUpClick} 
                        className="btn btn-dark rounded-pill action-btn"
                    >
                        Sign Up Now
                    </button>
                ) : (
                    <button className="btn btn-primary rounded-pill action-btn">
                        View My Bookings
                    </button>
                )}
            </div>

            <div className="full-width-image-wrapper">
                <img src="/airplane.png" alt="Plane" className="hero-airplane" />
            </div>
        </div>
    );
}

export default HomeHero;