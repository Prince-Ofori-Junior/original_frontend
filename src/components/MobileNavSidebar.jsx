import React from "react";

function MobileNavSidebar({ open, onClose }) {
  return (
    <div className={`nav-sidebar ${open ? "open" : ""}`}>
      <button className="close-nav" onClick={onClose}>&times;</button>
      <ul>
        <li><a href="/">Home</a></li>
        <li className="dropdown">
          <a href="#!">Products ▾</a>
          <ul className="dropdown-menu">
            <li><a href="/furniture">Furnitures</a></li>
            <li><a href="#!">Food & Beverages</a></li>
          </ul>
        </li>
        <li><a href="#!">About</a></li>
        <li><a href="#!">Contact</a></li>
      </ul>
    </div>
  );
}

export default MobileNavSidebar;
