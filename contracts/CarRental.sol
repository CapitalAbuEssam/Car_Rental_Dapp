// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CarRental {
    // Owner of the contract
    address public owner;

    // Number of cars available
    uint public carCount = 0;

    // Struct to represent a car
    struct Car {
        uint id;
        string name;
        uint pricePerDay;
        bool isRented;
        address renter; // Address of the renter
        uint rentalEndTime; // Timestamp of when the rental ends
    }

    // Mapping of car IDs to Car structs
    mapping(uint => Car) public cars;

    // Events
    event CarAdded(uint id, string name, uint pricePerDay);
    event CarRented(uint id, address renter);
    event CarReturned(uint id);

    // Modifier to restrict access to the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Constructor to set the owner of the contract
    constructor() {
        owner = msg.sender;
    }

    // Function to add a new car, can only be called by the owner
    function addCar(string memory _name, uint _pricePerDay) public onlyOwner {
        carCount++;
        cars[carCount] = Car(carCount, _name, _pricePerDay, false, address(0), 0);
        emit CarAdded(carCount, _name, _pricePerDay);
    }

    // Function to rent a car
    function rentCar(uint _id, uint _days) public payable {
        Car storage car = cars[_id];
        require(_id > 0 && _id <= carCount, "Car ID is invalid");
        require(!car.isRented, "Car is already rented");
        require(msg.value == car.pricePerDay * _days, "Incorrect payment");

        car.isRented = true;
        car.renter = msg.sender;
        car.rentalEndTime = block.timestamp + (_days * 1 days);
        emit CarRented(_id, msg.sender);
    }

    // Function to return a car
    function returnCar(uint _id) public {
        Car storage car = cars[_id];
        require(car.isRented, "Car is not rented");
        require(car.renter == msg.sender, "Only the renter can return the car");

        car.isRented = false;
        car.renter = address(0);
        car.rentalEndTime = 0;
        emit CarReturned(_id);
    }

    // Function to check if a car is rented by a specific address
    function isCarRented(uint _id, address _renter) public view returns (bool) {
        return cars[_id].isRented && cars[_id].renter == _renter;
    }

    // Function to get the renter of a car
    function getRenter(uint _id) public view returns (address) {
        return cars[_id].renter;
    }
}
