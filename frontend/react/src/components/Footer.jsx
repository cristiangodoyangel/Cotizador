import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="app-footer">
      <p>creado por weblogica.cl</p>
      <p>&copy; {new Date().getFullYear()} - Sistema de Cotización</p>
    </footer>
  );
}

export default Footer;
