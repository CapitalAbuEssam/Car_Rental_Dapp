// src/components/CarList.js
/* global BigInt */
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
      setWeb3(web3Instance);
      setAccounts(accounts);
      setContract(contractInstance);
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

  const handleDaysChange = (carId, value) => {
    setRentalDays({
      ...rentalDays,
      [carId]: value
    });
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
      case 'ferrari':
          return ferrari;
      // Add cases for other cars as needed
      default:
        return DefaultCarImage; // Return null for unknown cars
    }
  };
  

  return (
    <div className="car-list">
      <h2>Available Cars</h2>
      <div className="car-items">
        {cars.map((car) => (
          <div key={car.id} className="car-item">
            <img src={getCarImage(car.name)} alt={car.name} className="car-image" />
            <h3>{car.name}</h3>
            <p>Price per Day: {web3 && cars.length > 0 ? web3.utils.fromWei(car.pricePerDay.toString(), 'ether') : 'Loading...'} ETH</p>
            {rentalStatus[car.id] ? (
              <>
                <div style={{ backgroundColor: '#f2f2f2', padding: '5px', marginBottom: '5px' }}>
                  Rented by account {car.renter.slice(-6)}
                </div>
                <button disabled style={{ backgroundColor: '#f2f2f2', color: '#666', cursor: 'not-allowed' }}>Rented</button>
              </>
            ) : (
              <>
                <input
                  type="number"
                  placeholder="Number of days"
                  value={rentalDays[car.id] || ''}
                  onChange={(e) => handleDaysChange(car.id, e.target.value)}
                />
                <button onClick={() => handleRentCar(car.id)} style={{ backgroundColor: 'green', color: 'white' }} disabled={rentalStatus[car.id]}>
                  Rent Car
                </button>
              </>
            )}
            {rentalStatus[car.id] && car.renter === accounts[0] && (
              <button onClick={() => handleReturnCar(car.id)} style={{ backgroundColor: 'red' }}>
                Return Car
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );  
}

export default CarList;
