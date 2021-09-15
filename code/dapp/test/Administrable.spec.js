const chai = require("chai");
const expect = require("chai").expect;
const Main = artifacts.require("Main");

chai.use(require("chai-as-promised"));

contract("Administrable", async function (accounts) {
    describe("getOwner()", async function() {
        it("the owner is correct", async function() {
            const main = await Main.deployed();
            const owner = await main.getOwner();

            expect(owner).to.equal(accounts[0]);
        });
    })
    describe("shutdown()", async function(){
        it("throws if a wrong client tries to shutdown", async function() {
            const main = await Main.deployed();
            const prom = main.shutdown({from: accounts[1]});

            await expect(prom).not.be.fulfilled;
        });
        it("allows the owner to selfdestruct the contract", async function() {
            const main = await Main.deployed();
            const shutdown = main.shutdown({from: accounts[0]});

            await expect(shutdown).be.fulfilled;
        });
    });

});
