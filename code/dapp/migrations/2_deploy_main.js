const Main = artifacts.require("Main");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Main, {from: accounts[0]});
};
