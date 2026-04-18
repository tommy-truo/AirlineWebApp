import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";

import ManagerHome from "./ManagerHome.jsx";
import EmployeeAssignments from "./EmployeeAssignments.jsx";
import EmployeeManagement from "./EmployeeManagement.jsx";
import EmployeeRegisterForm from "./EmployeeRegisterForm.jsx";
import EmployeeShiftRequests from "./EmployeeShiftRequests.jsx";
import FlightManagement from "./FlightManagement.jsx";
import CreateFlight from "./CreateFlight.jsx";
import PayrollReports from "./PayrollReports.jsx";
import TransactionHistory from "./TransactionHistory.jsx";
import TransactionReports from "./TransactionReports.jsx";
import FlightReports from "./FlightReports.jsx";

function ManagerDashboard({ employeeId, onLogout }) {
  return (
    <ManagerLayout onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<ManagerHome employeeId={employeeId} />} />
        <Route path="/assignments" element={<EmployeeAssignments employeeId={employeeId} />} />
        <Route path="/employee-directory" element={<EmployeeManagement employeeId={employeeId} />} />
        <Route path="/employee-register" element={<EmployeeRegisterForm employeeId={employeeId} />} />
        <Route path="/shift-requests" element={<EmployeeShiftRequests employeeId={employeeId} />} />
        <Route path="/flights" element={<FlightManagement employeeId={employeeId} />} />
        <Route path="/create-flight" element={<CreateFlight employeeId={employeeId} />} />
        <Route path="/flight-reports" element={<FlightReports employeeId={employeeId} />} />
        <Route path="/payroll-reports" element={<PayrollReports employeeId={employeeId} />} />
        <Route path="/transaction-history" element={<TransactionHistory />} />
        <Route path="/transaction-reports" element={<TransactionReports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ManagerLayout>
  );
}

export default ManagerDashboard;
