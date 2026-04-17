import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";

import EmployeeManagement from "./EmployeeManagement.jsx";
import EmployeeRegisterForm from "./EmployeeRegisterForm.jsx";
// import ManagerEmployeeRequests from "./ManagerEmployeeRequests.jsx";
import FlightManagement from "./FlightManagement.jsx";
import CreateFlight from "./CreateFlight.jsx";
// import ManagerPayroll from "./ManagerPayroll.jsx";
// import ManagerTransactions from "./ManagerTransactions.jsx";
// import ManagerTransactionReports from "./ManagerTransactionReports.jsx";
// import FlightReports from "./FlightReports.jsx";

function ManagerDashboard({ employeeId, onLogout }) {
  return (
    <ManagerLayout onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<EmployeeManagement employeeId={employeeId} />} />
        <Route path="/employee-directory" element={<EmployeeManagement employeeId={employeeId} />} />
        <Route path="/employee-register" element={<EmployeeRegisterForm employeeId={employeeId} />} />
        <Route path="/flights" element={<FlightManagement employeeId={employeeId} />} />
        <Route path="/create-flight" element={<CreateFlight employeeId={employeeId} />} />
        {/* <Route path="/employee-requests" element={<ManagerEmployeeRequests employeeId={employeeId} />} />
        <Route path="/payroll" element={<ManagerPayroll employeeId={employeeId} />} />
        <Route path="/transactions" element={<ManagerTransactions employeeId={employeeId} />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ManagerLayout>
  );
}

export default ManagerDashboard;
