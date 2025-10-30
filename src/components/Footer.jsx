import React from "react";

function Footer() {
  return (
    <footer>
      <div className="container footer-content">
        <div>
          <h3>MyBrand</h3>
          <p>Your trusted shop for furniture and food products.</p>
          <div className="icons">
            <a href="#!"><i className="fab fa-facebook-f"></i></a>
            <a href="#!"><i className="fab fa-twitter"></i></a>
            <a href="#!"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
        <div>
          <h4>Quick Links</h4>
          <a href="/Home">Home</a><br />
          <a href="/Products">Products</a><br />
          <a href="/About">About</a><br />
          <a href="/Contacts">Contact</a>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Accra, Ghana</p>
          <p>+233 XXX XXX XXX</p>
          <p>info@mybrand.com</p>
        </div>
      </div>
      <p style={{ textAlign: "center", color: "#040303d7" }}>&copy; 2025 Fosten Company. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
