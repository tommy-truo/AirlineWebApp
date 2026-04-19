import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ManagerLayout from "../components/ManagerLayout";

import ManagerHome from "./ManagerHome.jsx";
import ManagerEmployeeAssignments from "./ManagerEmployeeAssignments.jsx";
import ManagerEmployeeManagement from "./ManagerEmployeeManagement.jsx";
import ManagerEmployeeRegisterForm from "./ManagerEmployeeRegisterForm.jsx";
import ManagerEmployeeShiftRequests from "./ManagerEmployeeShiftRequests.jsx";
import ManagerFlightManagement from "./ManagerFlightManagement.jsx";
import ManagerCreateFlight from "./ManagerCreateFlight.jsx";
import ManagerPayrollReports from "./ManagerPayrollReports.jsx";
import ManagerTransactionHistory from "./ManagerTransactionHistory.jsx";
import ManagerTransactionReports from "./ManagerTransactionReports.jsx";
import ManagerFlightReports from "./ManagerFlightReports.jsx";
import ManagerFlashSaleManagement from "./ManagerFlashSaleManagement.jsx";
import ManagerCreateFlashSale from "./ManagerCreateFlashSale.jsx";

function ManagerDashboard({ employeeId, onLogout }) {
  return (
    <ManagerLayout onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<ManagerHome employeeId={employeeId} />} />
        <Route path="/assignments" element={<ManagerEmployeeAssignments employeeId={employeeId} />} />
        <Route path="/employee-directory" element={<ManagerEmployeeManagement employeeId={employeeId} />} />
        <Route path="/employee-register" element={<ManagerEmployeeRegisterForm employeeId={employeeId} />} />
        <Route path="/shift-requests" element={<ManagerEmployeeShiftRequests employeeId={employeeId} />} />
        <Route path="/flights" element={<ManagerFlightManagement employeeId={employeeId} />} />
        <Route path="/create-flight" element={<ManagerCreateFlight employeeId={employeeId} />} />
        <Route path="/flight-reports" element={<ManagerFlightReports employeeId={employeeId} />} />
        <Route path="/payroll-reports" element={<ManagerPayrollReports employeeId={employeeId} />} />
        <Route path="/transaction-history" element={<ManagerTransactionHistory />} />
        <Route path="/transaction-reports" element={<ManagerTransactionReports />} />
        <Route path="/flash-sales" element={<ManagerFlashSaleManagement />} />
        <Route path="/create-flash-sale" element={<ManagerCreateFlashSale />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ManagerLayout>
  );
}

export default ManagerDashboard;
