import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../components/styles.css";

function Sidebar({ onLogout }) {
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path ? "active" : "";
  }

  return (
    <div className="sidebar d-flex flex-column justify-content-between">
      <div>
        <div className="p-3">
          <h5 className="mb-4 sidebar-title">Manager Panel</h5>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link className={`nav-link sidebar-link ${isActive("/")}`} to="/">
                Overview
              </Link>
            </li>

            <li className="nav-item mt-2">
              <button
                className="nav-link btn btn-toggle"
                data-bs-toggle="collapse"
                data-bs-target="#employees-menu"
                type="button"
              >
                Employees
              </button>

              <div className="collapse show" id="employees-menu">
                <ul className="list-unstyled ms-3">
                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/employee-directory")}`} to="/employee-directory">
                      Directory
                    </Link>
                  </li>

                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/employee-register")}`} to="/employee-register">
                      Register Employee
                    </Link>
                  </li>

                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/shift-requests")}`} to="/shift-requests">
                      Requests
                    </Link>
                  </li>

                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/assignments")}`} to="/assignments">
                      Assignments
                    </Link>
                  </li>

                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/payroll-reports")}`} to="/payroll-reports">
                      Payroll Reports
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li className="nav-item mt-2">
              <button
                className="nav-link btn btn-toggle"
                data-bs-toggle="collapse"
                data-bs-target="#flights-menu"
                type="button"
              >
                Flights
              </button>

              <div className="collapse show" id="flights-menu">
                <ul className="list-unstyled ms-3">
                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/flights")}`} to="/flights">
                      Directory
                    </Link>
                  </li>

                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/create-flight")}`} to="/create-flight">
                      Create Flight
                    </Link>
                  </li>

                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/flight-reports")}`} to="/flight-reports">
                      Reports
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li className="nav-item mt-2">
              <button
                className="nav-link btn btn-toggle"
                data-bs-toggle="collapse"
                data-bs-target="#transactions-menu"
                type="button"
              >
                Transactions
              </button>

              <div className="collapse show" id="transactions-menu">
                <ul className="list-unstyled ms-3">
                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/transaction-history")}`} to="/transaction-history">
                      History
                    </Link>
                  </li>

                  <li>
                    <Link className={`nav-link sidebar-sub-link ${isActive("/transaction-reports")}`} to="/transaction-reports">
                      Reports
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="p-3 border-top sidebar-footer">
        <button
          className="btn btn-danger w-100 logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
