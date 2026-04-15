function Header({onLogout}) {
  return (

    <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-danger text-white">

      <div className="d-flex align-items-center">

        <img
          src="/acmelogo.png"
          alt="logo"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "contain",
            marginRight: "10px"
          }}
        />

        <h5 className="m-0">
          ACME Airlines
        </h5>

        <button
          onClick={onLogout}
          className="btn btn-light btn-sm"
        >
          Logout
        </button>

      </div>

    </div>

  )
}

export default Header