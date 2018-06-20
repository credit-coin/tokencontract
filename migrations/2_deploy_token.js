const CCOIN = artifacts.require("CCOIN.sol");
const Agreement = artifacts.require('credit-coin-contracts/contracts/Agreement.sol');
const ContentUtils = artifacts.require('credit-coin-contracts/contracts/ContentUtils.sol');
module.exports = async function(deployer) {
  await deployer.deploy(ContentUtils)
  await deployer.link(ContentUtils, [Agreement]);
  await deployer.deploy(CCOIN);
};
