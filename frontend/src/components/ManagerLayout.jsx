import React from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"

function ManagerLayout({ children, onLogout }) {
  return (
    <div className="d-flex">

      <Sidebar />

      <div className="flex-grow-1">

        <Header onLogout={onLogout} />

        <div className="flex-grow-1">
          {children}
        </div>

      </div>

    </div>
  )
}

export default ManagerLayout