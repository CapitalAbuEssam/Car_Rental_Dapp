const CarRental = artifacts.require("CarRental");

module.exports = function (deployer) {
    deployer.deploy(CarRental);
};
