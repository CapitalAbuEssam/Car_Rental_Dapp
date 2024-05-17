import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import CarRentalContract from './build/contracts/CarRental.json';
import CarList from './components/CarList';
import AddCar from './components/AddCar';
import Header from './components/Header.js';

function App() {
  const [contractInstance, setContractInstance] = useState(null);
  const rentalServiceName = "Muhammad Essam";
  const accountAddress = "0x1234...";

  useEffect(() => {
    async function initContract() {
      // Connect to MetaMask provider
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.enable();
          const web3 = window.web3;

          // Get contract instance
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = CarRentalContract.networks[networkId];
          const contract = new web3.eth.Contract(
            CarRentalContract.abi,
            deployedNetwork && deployedNetwork.address,
          );

          setContractInstance(contract);
        } catch (error) {
          console.error('Error connecting to provider:', error);
        }
      } else {
        console.error('Please install MetaMask!');
      }
    }

    initContract();
  }, []);

  // Example function to call contract method
  const rentCar = async () => {
    try {
      const accounts = await window.web3.eth.getAccounts();
      await contractInstance.methods.rentCar(1, 3).send({ from: accounts[0], value: 300 });
    } catch (error) {
      console.error('Error renting car:', error);
    }
  };

  return (
    <div className="App">
      <Header />
      <CarList />
      <AddCar />
    </div>
  );
}

export default App;
