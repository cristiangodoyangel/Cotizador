import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <a className="link" href="https://www.weblogica.cl">
        www.weblogica.cl
      </a>
      <p>&copy; {new Date().getFullYear()} - Sistema de Cotización</p>
    </footer>
  );
}

export default Footer;
