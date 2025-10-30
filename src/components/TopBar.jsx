import React from "react";
import "../TopBar.css"

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <a href="#!"><i className="fab fa-facebook-f"></i></a>
        <a href="#!"><i className="fab fa-instagram"></i></a>
        <a href="#!"><i className="fab fa-twitter"></i></a>
      </div>
      <div className="topbar-center">
        <p>Welcome to  <b><i>FoSTEN CoM.</i></b>  – Quality You Can Trust</p>
      </div>
      <div className="topbar-right">
        <img src="https://flagcdn.com/w20/gh.png" alt="Ghana Flag" />
      </div>
    </div>
  );
}

export default TopBar;
