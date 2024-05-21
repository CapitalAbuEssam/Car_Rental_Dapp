import React, { useState, useEffect } from 'react';
import CarRentalContract from '../build/contracts/CarRental.json';
import getWeb3 from '../getWeb3';
import './CarList.css';
// Import car images
import teslaModelS from '../carImages/tesla-model-s.png';
import DefaultCarImage from '../carImages/default-car-image.png';
import lamborghini from '../carImages/lamborghini.png';
import mclaren from '../carImages/mclaren.png';
import ferrari from '../carImages/ferrari.png';
import f12 from '../carImages/f12.png';

const CarList = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [cars, setCars] = useState([]);
  const [rentalDays, setRentalDays] = useState({});
  const [rentalStatus, setRentalStatus] = useState({});
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      const web3Instance = await getWeb3();
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = CarRentalContract.networks[networkId];
      const contractInstance = new web3Instance.eth.Contract(
        CarRentalContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const accounts = await web3Instance.eth.getAccounts();
      const owner = await contractInstance.methods.owner().call(); // Fetch the owner
      setWeb3(web3Instance);
      setAccounts(accounts);
      setContract(contractInstance);
      setOwner(owner); // Set the owner state
      loadCars(contractInstance, accounts);
    };
    initWeb3();
  }, []);

  const loadCars = async (contract, accounts) => {
    if (!accounts) return; // Check if accounts is null
    const carCount = await contract.methods.carCount().call();
    const carsArray = [];
    const rentalStatusObject = {};
  
    // Loop through each car
    for (let i = 1; i <= carCount; i++) {
      const car = await contract.methods.cars(i).call();
      if (!car.id) continue; // Skip if the car has been removed
      carsArray.push(car);
  
      // Initialize rental status for the current car to false
      rentalStatusObject[i] = false;
  
      // Check rental status for the current account
      const isRented = await contract.methods.isCarRented(i, accounts[0]).call();
      if (isRented) {
        rentalStatusObject[i] = true;
      }
  
      // Check if any other account has rented the car
      if (!isRented) {
        for (let j = 1; j < accounts.length; j++) {
          const otherIsRented = await contract.methods.isCarRented(i, accounts[j]).call();
          if (otherIsRented) {
            rentalStatusObject[i] = true;
            break;
          }
        }
      }
    }
  
    setCars(carsArray);
    setRentalStatus(rentalStatusObject);
  };  

  const handleRentCar = async (carId) => {
    // Check if rental days are undefined or empty
    if (!rentalDays[carId]) {
      alert('Please enter the number of days to rent the car');
      return;
    }

    const days = BigInt(rentalDays[carId]);
    const pricePerDay = BigInt(cars.find(car => car.id === carId).pricePerDay);
    const totalCost = pricePerDay * days;

    try {
      await contract.methods.rentCar(carId, days).send({ from: accounts[0], value: totalCost.toString() });
      alert(`Car rented for ${days} days`);
      loadCars(contract, accounts); // Refresh the car list
    } catch (error) {
      console.error('Error renting car:', error);
      alert('Error renting car');
    }
  };

  const handleReturnCar = async (carId) => {
    try {
      await contract.methods.returnCar(carId).send({ from: accounts[0] });
      alert('Car returned successfully');
      loadCars(contract, accounts); // Refresh the car list
    } catch (error) {
      console.error('Error returning car:', error);
      alert('Error returning car');
    }
  };

  const handleRemoveCar = async (carId) => {
    if (!web3 || !accounts || !contract) {
      alert('Web3, accounts, or contract not loaded');
      return;
    }
  
    try {
      const owner = await contract.methods.owner().call();
  
      if (accounts[0] !== owner) {
        alert('You do not have permission to remove cars');
        return;
      }
  
      const isCarRented = await contract.methods.isCarRented(carId, accounts[0]).call(); // Pass the account as well
      if (isCarRented) {
        const renter = await contract.methods.getRenter(carId).call();
        alert(`Cannot remove car because it is being rented by ${renter}`);
        return;
      }
  
      console.log('Attempting to remove car:', carId); // Add this line for logging
  
      await contract.methods.removeCar(carId).send({ from: accounts[0] });
      alert('Car removed successfully');
      
      // Remove the card from the frontend
      setCars(prevCars => prevCars.filter(car => car.id !== carId));
    } catch (error) {
      console.error('Error removing car:', error);
      alert('Error removing car');
    }
  };

  const handleDaysChange = (carId, value) => {
    // Parse the input value as an integer
    const newValue = parseInt(value);
    // Check if the parsed value is a valid positive number
    if (!isNaN(newValue) && newValue > 0) {
      // Update the rental days state
      setRentalDays({
        ...rentalDays,
        [carId]: newValue
      });
    } else {
      // If the input is invalid, set the rental days to an empty string
      setRentalDays({
        ...rentalDays,
        [carId]: ''
      });
    }
  };

  const getCarImage = (carName) => {
    switch (carName) {
      case 'Tesla Model S':
        return teslaModelS;
      case 'lamborghini':
        return lamborghini;
      case 'mclaren':
        return mclaren;
      case 'ferrari':
        return ferrari;
      case 'f12':
        return f12;
      // Add cases for other cars as needed
      default:
        return DefaultCarImage; // Return null for unknown cars
    }
  };

  return (
    <div className="car-list">
      <h2>Available Cars</h2>
      <div className="car-items">
      {cars.map((car, index) => (
  !car.removed && (
    <div key={`${car.id}-${index}`} className="car-item">
      {accounts[0] === owner && ( // Only render the button if the current account is the owner
        <button onClick={() => handleRemoveCar(car.id)} className="remove-btn">
          X
        </button>
      )}
      <img src={getCarImage(car.name)} alt={car.name} className="car-image" />
      <h3>{car.name}</h3>
      <p>Price per Day: {web3 && cars.length > 0 ? web3.utils.fromWei(car.pricePerDay.toString(), 'ether') : 'Loading...'} ETH</p>
      {rentalStatus[car.id] ? (
        <>
          <div style={{ backgroundColor: '#f2f2f2', padding: '5px', marginBottom: '5px' }}>
            Rented by account {car.renter.slice(-6)}
          </div>
          <button disabled className="rented">Rented</button>
        </>
      ) : (
        <>
          <input
            type="number"
            placeholder="Number of days"
            value={rentalDays[car.id] || ''}
            onChange={(e) => handleDaysChange(car.id, e.target.value)}
          />
          <button onClick={() => handleRentCar(car.id)} className="rent-btn" disabled={rentalStatus[car.id]}>
            Rent Car
          </button>
        </>
      )}
      {rentalStatus[car.id] && car.renter === accounts[0] && (
        <button onClick={() => handleReturnCar(car.id)} className="return-btn">
          Return Car
        </button>
      )}
    </div>
  )
))}
      </div>
    </div>
  );
};

export default CarList;
