const CCOIN = artifacts.require("CCOIN.sol");

module.exports = function(deployer) {
  deployer.deploy(CCOIN);
};
