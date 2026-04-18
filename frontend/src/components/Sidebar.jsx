import React from "react";
import { Link } from "react-router-dom";
import "../styles/styles.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="p-3">
        <h5 className="mb-4">Menu</h5>

        <ul className="nav flex-column">
          {/* Home */}
          <li className="nav-item">
            <Link className="nav-link sidebar-link" to="/">
              Home
            </Link>
          </li>

          {/* Shift Assignment */}
          <li className="nav-item">
            <Link className="nav-link sidebar-link" to="/shift-calendar">
              Shift Assignment
            </Link>
          </li>

          {/* Employees */}
          <li className="nav-item">
            <button
              className="nav-link btn btn-toggle align-items-center"
              data-bs-toggle="collapse"
              data-bs-target="#employees-menu"
              type="button"
            >
              Employees
            </button>

            <div className="collapse" id="employees-menu">
              <ul className="btn-toggle-nav list-unstyled fw-normal ms-3">
                <li>
                  <Link className="nav-link" to="/employee-directory">
                    Employee Directory
                  </Link>
                </li>

                <li>
                  <Link className="nav-link" to="/employee-register">
                    Register New Employee
                  </Link>
                </li>

                <li>
                  <Link className="nav-link" to="/shift-requests">
                    Employee Shift Requests
                  </Link>
                </li>

                <li>
                  <Link className="nav-link" to="/payroll-reports">
                    Payroll Reports
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Flights */}
          <li className="nav-item mt-2">
            <button
              className="nav-link btn btn-toggle"
              data-bs-toggle="collapse"
              data-bs-target="#flights-menu"
              type="button"
            >
              Flights
            </button>

            <div className="collapse" id="flights-menu">
              <ul className="list-unstyled ms-3">
                <li>
                  <Link className="nav-link" to="/flights">
                    Flight Management
                  </Link>
                </li>

                <li>
                  <Link className="nav-link" to="/create-flight">
                    Create Flight
                  </Link>
                </li>

                <li>
                  <Link className="nav-link" to="/reports">
                    Flight Reports
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Transactions */}
          <li className="nav-item mt-2">
            <Link className="nav-link" to="/transaction-history">
              Transaction History
            </Link>
          </li>

          <li className="nav-item mt-2">
            <Link className="nav-link" to="/transaction-reports">
              Transaction Reports
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
