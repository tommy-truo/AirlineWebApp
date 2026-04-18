function Header() {
  return (
    <div className="manager-header d-flex align-items-center px-4 py-3 text-white">
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

      <h5 className="m-0">ACME Airlines</h5>
    </div>
  );
}

export default Header;
