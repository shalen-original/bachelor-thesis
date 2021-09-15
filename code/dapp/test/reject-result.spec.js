const re = require("./RequestHelper.js")
const Computation = require("./Computation.js")
const chai = require("chai");
const expect = chai.expect;

chai.use(require("chai-as-promised"));
chai.use(require("chai-bignumber")(web3.BigNumber));

module.exports = async function (accounts, Main) {
    let publisher = accounts[0];
    let publisher2 = accounts[3];
    let farmer = accounts[1];
    let farmer2 = accounts[2];

    describe("rejectResult()", async function (){
        it("launches the correct event", async function(){
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);

            expect(txs.rejectTx.logs).to.have.lengthOf(1);
            expect(txs.rejectTx.logs[0].event).to.equal("ResultRejected");
            expect(txs.rejectTx.logs[0].args.id).to.bignumber.equal(txs.id);
        });
        it("fails if the computation does not exist", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const prom = txs.main.rejectResult(1000, {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if someone that is not the publisher tries to reject the result", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const prom = txs.main.rejectResult(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is not done", async function(){
            const txs = await re.createAssignedComp(Main, publisher, farmer);
            const prom = txs.main.rejectResult(txs.id, {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is already rejected", async function(){
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);
            const prom = txs.main.rejectResult(txs.id, {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is already accepted", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const prom = txs.main.rejectResult(txs.id, {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("correctly updates the computation status", async function(){
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);

            expect(txs.detailsAfterRejectTx.status).to.equal("REJECTED");
        });
        it("correctly updates the computation audit fee", async function() {
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);

            expect(txs.detailsAfterDoneTx.auditFee).to.bignumber.equal(0);
            expect(txs.detailsAfterRejectTx.auditFee).to.bignumber.equal(re.defaultAuditFee());
        });
    });
};
