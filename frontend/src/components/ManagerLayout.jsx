import React from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"

function ManagerLayout({ children, onLogout }) {
  return (
    <div className="d-flex manager-shell">

      <Sidebar onLogout={onLogout} />

      <div className="flex-grow-1 d-flex flex-column manager-content-area">

        <Header />

        <div className="flex-grow-1 overflow-auto">
          {children}
        </div>

      </div>

    </div>
  )
}

export default ManagerLayout
