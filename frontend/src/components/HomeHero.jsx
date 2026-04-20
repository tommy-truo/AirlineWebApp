import React from "react";
import "./HomeHero.css";

const HomeHero = ({ isLoggedIn, onSignupClick }) => {
    return (
        <div className="hero-container">

            <div className="text-content">
                <h1 className="hero-subtitle">Fly Acme Airlines</h1>
                <p className="hero-subtile">Economical, Luxurious, Fast.</p>

                {!isLoggedIn && (
                    <button
                        className="action-btn"
                        onClick={onSignupClick}
                    >
                        Sign Up Now
                    </button>
                )}
            </div>

            <div className="full-width-image-wrapper">
                <img
                    src="/airplane.png"
                    alt="Plane"
                    className="hero-airplane"
                />
            </div>

        </div>
    );
};

export default HomeHero;