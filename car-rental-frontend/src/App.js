import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import CarRentalContract from './build/contracts/CarRental.json';
import CarList from './components/CarList';
import AddCar from './components/AddCar';
import Footer from './components/footer.js';
import Header from './components/Header.js';

function App() {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    async function initContract() {
      // Connect to MetaMask provider and initialize contract instance
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        try {
          // Request account access
          await window.ethereum.enable();
          const web3 = window.web3;

          // Get contract instance
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = CarRentalContract.networks[networkId];
          const contractInstance = new web3.eth.Contract(
            CarRentalContract.abi,
            deployedNetwork && deployedNetwork.address,
          );

          // Set the contract instance to state
          setContract(contractInstance);
        } catch (error) {
          console.error('Error connecting to provider:', error);
        }
      } else {
        console.error('Please install MetaMask!');
      }
    }

    initContract();
  }, []);

  return (
    <div className="App">
      <Header />
      <CarList contract={contract} />
      <AddCar contract={contract} />
      <div style={{ marginBottom: '80px' }}> {/* Adjust margin bottom as needed */} </div>
      <Footer />
    </div>
  );
}

export default App;
