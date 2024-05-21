import React, { useState, useEffect } from 'react';
import CarRentalContract from '../build/contracts/CarRental.json';
import getWeb3 from '../getWeb3';
import './AddCar.css';

const AddCar = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [carName, setCarName] = useState('');
  const [carPrice, setCarPrice] = useState('');
  const [carImage, setCarImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = await getWeb3();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = CarRentalContract.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          CarRentalContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccounts(accounts);
        setContract(contractInstance);
        setLoading(false);

        // Event listeners for MetaMask account and network changes
        if (window.ethereum) {
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          window.ethereum.on('chainChanged', handleChainChanged);
          console.log('Event listeners registered');
        }
      } catch (error) {
        console.error('Error initializing web3:', error);
        alert('Failed to load web3, accounts, or contract. Check console for details.');
      }
    };

    const handleAccountsChanged = (newAccounts) => {
      console.log('Accounts changed:', newAccounts);
      setAccounts(newAccounts);
    };

    const handleChainChanged = () => {
      console.log('Chain changed');
      window.location.reload();
    };

    initWeb3();

    // Cleanup event listeners on component unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        console.log('Event listeners removed');
      }
    };
  }, []);

  const handleAddCar = async () => {
    if (!web3 || !accounts || !contract) {
      alert('Web3, accounts, or contract not loaded');
      return;
    }
  
    if (carName === '' || carPrice === '' || !carImage) {
      alert('Please fill in all fields and select an image');
      return;
    }
  
    // Validate carPrice using regex
    const regex = /^\d*\.?\d+$/;
    if (!regex.test(carPrice) || parseFloat(carPrice) <= 0) {
      alert('Please enter a valid positive number for the price');
      return;
    }
  
    const priceInWei = web3.utils.toWei(carPrice, 'ether');
  
    try {
      const owner = await contract.methods.owner().call();
  
      if (accounts[0] !== owner) {
        alert('You do not have permission to add a car');
        return;
      }
  
      await contract.methods.addCar(carName, priceInWei).send({ from: accounts[0] });
      alert('Car added successfully');
    } catch (error) {
      console.error('Error adding car:', error);
      alert('Error adding car');
    }
  };  

  const handleImageUpload = (event) => {
    setCarImage(URL.createObjectURL(event.target.files[0]));
  };

  if (loading) {
    return <div>Loading Web3, accounts, and contract...</div>;
  }

  return (
    <div className="add-car">
      <h2>Add New Car</h2>
      <input
        type="text"
        placeholder="Car Name"
        value={carName}
        onChange={(e) => setCarName(e.target.value)}
      />
      <input
        type="number"
        min="0"
        placeholder="Price per Day (in ETH)"
        value={carPrice}
        onChange={(e) => setCarPrice(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
      />
      {carImage && <img src={carImage} alt="Car Preview" className="car-preview" />}
      <button onClick={handleAddCar}>Add Car</button>
    </div>
  );
}

export default AddCar;
