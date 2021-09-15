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

    describe("requestComputation()", async function(){
        it("generates the correct event", async function() {
            let txs = await re.createRequestedComputation(Main, publisher);
            
            // Check that a single event has been published
            expect(txs.publishTx.logs).to.have.lengthOf(1);
            expect(txs.publishTx.logs[0].event).to.equal("ComputationPublished");

            // Check that the fields of the events are correct
            let evt = txs.publishTx.logs[0].args;
            expect(evt.id).to.not.be.null;
            expect(evt.publishedBy).to.equal(publisher);
        });
        it("creates a computation with the correct status", async function() {
            let txs = await re.createRequestedComputation(Main, publisher);

            let det = txs.detailsAfterPublishTx;
            expect(det.status).to.equal("CREATED");
        });
    });
};
