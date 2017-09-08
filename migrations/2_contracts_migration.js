var Adoption = artifacts.require('./Adoption.sol');

module.exports = (deployer) => {
   deployer.deploy(Adoption);
};