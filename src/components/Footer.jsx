import React from 'react';
import { Container } from 'react-bootstrap';
import { FaPaypal, FaCcVisa, FaCcMastercard, FaApplePay, FaGooglePay } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="text-white text-center py-3 mt-4" style={{ backgroundColor: '#27374D' }}>
      <Container>
        <h2>Aceptamos todo medio de pago</h2>
        <div className="payment-methods my-2">
          <FaPaypal className="fa-beat-fade fa-xl mx-2" />
          <FaCcVisa className="fa-beat-fade fa-xl mx-2" />
          <FaCcMastercard className="fa-beat-fade fa-xl mx-2" />
          <FaApplePay className="fa-beat-fade fa-xl mx-2" />
          <FaGooglePay className="fa-beat-fade fa-xl mx-2" />
        </div>
        <p>© 2025 Level-Up Gamer. Todos los derechos reservados.</p>
      </Container>
    </footer>
  );
}

export default Footer;
