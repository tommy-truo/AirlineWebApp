import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";

import EmployeeManagement from "./EmployeeManagement.jsx";
import EmployeeRegisterForm from "./EmployeeRegisterForm.jsx";
// import ManagerChangeAircraft from "./ManagerChangeAircraft.jsx";
// import ManagerChangeGate from "./ManagerChangeGate.jsx";
// import ManagerEmployeeRequests from "./ManagerEmployeeRequests.jsx";
// import ManagerFlightManagement from "./ManagerFlightManagement.jsx";
// import ManagerPayroll from "./ManagerPayroll.jsx";
// import ManagerReports from "./ManagerReports.jsx";
// import ManagerShiftCalendar from "./ManagerShiftCalendar.jsx";
// import ManagerTransactions from "./ManagerTransactions.jsx";
// import ManagerUpdateSalary from "./ManagerUpdateSalary.jsx";

function ManagerDashboard({ employeeId, onLogout }) {
  return (
    <ManagerLayout onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<EmployeeManagement employeeId={employeeId} />} />
        <Route path="/employee-directory" element={<EmployeeManagement employeeId={employeeId} />} />
        <Route path="/employee-register" element={<EmployeeRegisterForm employeeId={employeeId} />} />
        {/* <Route path="/employee-requests" element={<ManagerEmployeeRequests employeeId={employeeId} />} />
        <Route path="/payroll" element={<ManagerPayroll employeeId={employeeId} />} />
        <Route path="/update-salary" element={<ManagerUpdateSalary employeeId={employeeId} />} />
        <Route path="/flights" element={<ManagerFlightManagement employeeId={employeeId} />} />
        <Route path="/change-gate" element={<ManagerChangeGate employeeId={employeeId} />} />
        <Route path="/change-aircraft" element={<ManagerChangeAircraft employeeId={employeeId} />} />
        <Route path="/reports" element={<ManagerReports employeeId={employeeId} />} />
        <Route path="/shift-calendar" element={<ManagerShiftCalendar employeeId={employeeId} />} />
        <Route path="/transactions" element={<ManagerTransactions employeeId={employeeId} />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ManagerLayout>
  );
}

export default ManagerDashboard;