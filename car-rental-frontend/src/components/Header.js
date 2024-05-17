// src/components/Header.js

import React, { useState, useEffect } from 'react';
import './Header.css';

function Header({ rentalServiceName }) {
  const [accountAddress, setAccountAddress] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setAccountAddress(accounts[0]);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    if (window.ethereum) {
      fetchAccount();
      window.ethereum.on('accountsChanged', fetchAccount);
    }
  }, []);

  return (
    <div className="header">
      <div className="rental-service">{rentalServiceName}</div>
      <div className="account-address">Account: {accountAddress}</div>
    </div>
  );
}

export default Header;

