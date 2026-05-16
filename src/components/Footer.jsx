import React from 'react';
import { Container } from 'react-bootstrap';
import { FaPaypal, FaCcVisa, FaCcMastercard, FaApplePay, FaGooglePay } from 'react-icons/fa';

function Footer() {
  const iconStyle = {
    color: '#9898c8',
    margin: '0 10px',
    fontSize: '1.6rem',
    transition: 'color 0.3s, filter 0.3s, transform 0.3s',
    cursor: 'default',
  };

  const iconHover = (e) => {
    e.currentTarget.style.color = '#00d4ff';
    e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(0,212,255,0.7))';
    e.currentTarget.style.transform = 'translateY(-3px)';
  };

  const iconLeave = (e) => {
    e.currentTarget.style.color = '#9898c8';
    e.currentTarget.style.filter = 'none';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <footer className="text-center" style={{ position: 'relative', zIndex: 1 }}>
      <Container>
        <p style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#55557a',
          marginBottom: '10px'
        }}>
          Aceptamos todo medio de pago
        </p>
        <div className="payment-methods my-2" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FaPaypal style={iconStyle} onMouseEnter={iconHover} onMouseLeave={iconLeave} />
          <FaCcVisa style={iconStyle} onMouseEnter={iconHover} onMouseLeave={iconLeave} />
          <FaCcMastercard style={iconStyle} onMouseEnter={iconHover} onMouseLeave={iconLeave} />
          <FaApplePay style={iconStyle} onMouseEnter={iconHover} onMouseLeave={iconLeave} />
          <FaGooglePay style={iconStyle} onMouseEnter={iconHover} onMouseLeave={iconLeave} />
        </div>
        <p style={{ fontSize: '0.75rem', color: '#55557a', marginTop: '8px' }}>
          © 2025 Level-Up Gamer. Todos los derechos reservados.
        </p>
      </Container>
    </footer>
  );
}

export default Footer;
