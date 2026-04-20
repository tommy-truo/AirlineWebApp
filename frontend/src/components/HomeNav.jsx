import React from "react";
import "./HomeNav.css";

const HomeNav = ({ onLoginClick, onSignupClick, isLoggedIn, onLogoutClick }) => {
    return (
        <nav className="custom-nav">

            <div className="logo-container">
                <img src="acmelogo.png" alt="Logo" className="navbar-logo me-2" />
                <span className="logo-text">Acme Airlines</span>
            </div>

            {isLoggedIn ? (
                <button onClick={onLogoutClick} className="nav-btn">
                    Logout
                </button>
            ) : (
                <div>
                    <button onClick={onLoginClick} className="nav-btn">
                        Login
                    </button>
                </div>
            )}

        </nav>
    );
};

export default HomeNav;