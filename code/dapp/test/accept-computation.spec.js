const re = require("./RequestHelper.js")
const Computation = require("./Computation.js")
const chai = require("chai");
const expect = chai.expect;

chai.use(require("chai-as-promised"));
chai.use(require("chai-bignumber")(web3.BigNumber));

module.exports = async function (accounts, Main) {
    let publisher = accounts[0];
    let farmer = accounts[1];
    let farmer2 = accounts[2];

    describe("acceptComputation()", async function (){
        it("throws the correct event", async function() {
            let txs = await re.createAssignedComp(Main, publisher, farmer);

            expect(txs.acceptTx.logs).to.have.lengthOf(1);
            expect(txs.acceptTx.logs[0].event).to.equal("ComputationAssigned");

            let evt = txs.acceptTx.logs[0].args;
            expect(evt.id).to.bignumber.equal(txs.id);
            expect(evt.assignedTo).to.equal(farmer);
        });
        it("actually assign the computation to the farmer", async function() {
            let txs = await re.createAssignedComp(Main, publisher, farmer);
            expect(txs.detailsAfterAcceptTx.assignedTo).to.equal(farmer);
        });
        it("correctly updates the computation status", async function() {
            let txs = await re.createAssignedComp(Main, publisher, farmer);
            expect(txs.detailsAfterAcceptTx.status).to.equal("ASSIGNED");
        });
        it("throws if the computation does not exist", async function() {
            let txs = await re.createRequestedComputation(Main, publisher);
            let prom = txs.main.acceptComputation(1000, {from: farmer});
            await expect(prom).not.be.fulfilled;
        });
        it("throws if a second farmer tries to accept a computation", async function() {
            let txs = await re.createAssignedComp(Main, publisher, farmer);
            let prom = txs.main.acceptComputation(txs.id, {from: farmer2});

            await expect(prom).not.be.fulfilled;
        });
    });
};
