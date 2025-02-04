const CarRental = artifacts.require("CarRental");

contract("CarRental", (accounts) => {
  let carRentalInstance;
  const owner = accounts[0];
  const renter1 = accounts[1];
  const renter2 = accounts[2];

  beforeEach(async () => {
    carRentalInstance = await CarRental.new({ from: owner });
  });

  it("should allow the owner to add a car", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    const car = await carRentalInstance.cars(1);
    expect(car.name).to.equal("Tesla Model S");
    expect(car.pricePerDay.toString()).to.equal(web3.utils.toWei("1", "ether"));
    expect(car.isRented).to.be.false;
  });

  it("should not allow non-owner to add a car", async () => {
    const { expect } = await import('chai');
    try {
      await carRentalInstance.addCar("BMW", web3.utils.toWei("1", "ether"), { from: renter1 });
      expect.fail("Non-owner was able to add a car");
    } catch (error) {
      expect(error.reason).to.equal("Only the owner can perform this action");
    }
  });

  it("should allow a user to rent a car", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    await carRentalInstance.rentCar(1, 2, { from: renter1, value: web3.utils.toWei("2", "ether") });

    const car = await carRentalInstance.cars(1);
    expect(car.isRented).to.be.true;
    expect(car.renter).to.equal(renter1);
  });

  it("should not allow renting a car that is already rented", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    await carRentalInstance.rentCar(1, 2, { from: renter1, value: web3.utils.toWei("2", "ether") });

    try {
      await carRentalInstance.rentCar(1, 2, { from: renter2, value: web3.utils.toWei("2", "ether") });
      expect.fail("Allowed to rent a car that is already rented");
    } catch (error) {
      expect(error.reason).to.equal("Car is already rented");
    }
  });

  it("should allow the renter to return the car", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    await carRentalInstance.rentCar(1, 2, { from: renter1, value: web3.utils.toWei("2", "ether") });
    await carRentalInstance.returnCar(1, { from: renter1 });

    const car = await carRentalInstance.cars(1);
    expect(car.isRented).to.be.false;
    expect(car.renter).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("should not allow non-renter to return the car", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    await carRentalInstance.rentCar(1, 2, { from: renter1, value: web3.utils.toWei("2", "ether") });

    try {
      await carRentalInstance.returnCar(1, { from: renter2 });
      expect.fail("Non-renter was able to return the car");
    } catch (error) {
      expect(error.reason).to.equal("Only the renter can return the car");
    }
  });

  it("should not allow renting with incorrect payment", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });

    try {
      await carRentalInstance.rentCar(1, 2, { from: renter1, value: web3.utils.toWei("1", "ether") });
      expect.fail("Allowed renting with incorrect payment");
    } catch (error) {
      expect(error.reason).to.equal("Incorrect payment");
    }
  });

  it("should correctly indicate if a car is rented by a specific address", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    await carRentalInstance.rentCar(1, 2, { from: renter1, value: web3.utils.toWei("2", "ether") });

    const isRentedByRenter1 = await carRentalInstance.isCarRented(1, renter1);
    const isRentedByRenter2 = await carRentalInstance.isCarRented(1, renter2);

    expect(isRentedByRenter1).to.be.true;
    expect(isRentedByRenter2).to.be.false;
  });

  it("should correctly return the renter of a car", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    await carRentalInstance.rentCar(1, 2, { from: renter1, value: web3.utils.toWei("2", "ether") });

    const renter = await carRentalInstance.getRenter(1);
    expect(renter).to.equal(renter1);
  });

  it("should allow the owner to remove a car", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    await carRentalInstance.removeCar(1, { from: owner });

    const car = await carRentalInstance.cars(1);
    expect(car.id.toNumber()).to.equal(0); // Convert BN to number and then check if the ID is default (0)
    expect(car.name).to.equal(""); // Check if the name is default (empty string)
    expect(car.pricePerDay.toString()).to.equal("0"); // Convert BN to string and then check if the pricePerDay is default (0)
    expect(car.isRented).to.be.false; // Check if isRented is default (false)
    expect(car.renter).to.equal("0x0000000000000000000000000000000000000000"); // Check if renter is default (address 0)
    expect(car.rentalEndTime.toNumber()).to.equal(0); // Convert BN to number and then check if rentalEndTime is default (0)
  });

  it("should not allow the owner to remove a car that is currently rented", async () => {
    const { expect } = await import('chai');
    await carRentalInstance.addCar("Tesla Model S", web3.utils.toWei("1", "ether"), { from: owner });
    await carRentalInstance.rentCar(1, 2, { from: renter1, value: web3.utils.toWei("2", "ether") });

    try {
      await carRentalInstance.removeCar(1, { from: owner });
      expect.fail("Owner was able to remove a rented car");
    } catch (error) {
      expect(error.reason).to.equal("Cannot remove a car that is currently rented");
    }
  });
});
