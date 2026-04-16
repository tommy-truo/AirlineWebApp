/* Abhishek Singh */
import React from "react";
import "./HomeNav.css";

const HomeNav = ({ isLoggedIn, onLogoutClick, onLoginClick }) => {
    return (
        <nav className="custom-nav">
            <div className="logo-container">
                <img src="acmelogo.png" alt="Logo" className="navbar-logo me-2" />
                <span className="logo-text">Acme Airlines</span>
            </div>
            
            <div className="nav-links">
                {isLoggedIn ? (
                    <button onClick={onLogoutClick} className="nav-btn">Logout</button>
                ) : (
                    <button onClick={onLoginClick} className="nav-btn">
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default HomeNav;