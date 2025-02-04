// Footer.js
import React, { useState, useEffect } from 'react';
import './footer.css';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight;
      setIsVisible(scrolledToBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`footer${isVisible ? ' visible' : ''}`}>
      <div className="container">
        <p className="text-muted">© Car Rental Dapp created by Muhammad Essam</p>
      </div>
    </div>
  );
};

export default Footer;
