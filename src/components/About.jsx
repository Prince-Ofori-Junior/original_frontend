import React from "react";
import AboutImage from "../assets/WhatsApp Image 2025-09-16 at 15.06.07_6231b3d2.jpg";

function About() {
  return (
    <section className="section">
      <div className="container about-snippet">
        <img src={AboutImage} alt="About Us" />
        <div>
          <h2 className="about-text">About Us</h2>
          <p>
            We are a local Ghanaian business offering beautiful furniture, healthy Tom Brown and fresh groundnut paste. Quality and customer satisfaction is our priority.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
