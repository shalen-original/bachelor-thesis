const re = require("./RequestHelper.js")
const Computation = require("./Computation.js")
const chai = require("chai");
const expect = chai.expect;

chai.use(require("chai-as-promised"));
chai.use(require("chai-bignumber")(web3.BigNumber));

module.exports = async function (accounts, Main) {
    const publisher = accounts[0];
    const farmer = accounts[1];
    const farmer2 = accounts[2];

    describe("submitAuditorResult()", async function (){
        it("fails if is called by someone that is not the owner", async function() {
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);
            const prom = txs.main.submitAuditorResult(txs.id, re.defaultResultHash(web3), {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is already accepted", async function() {
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const prom = txs.main.submitAuditorResult(txs.id, re.defaultResultHash(web3), {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is not yet done", async function() {
            const txs = await re.createAssignedComp(Main, publisher, farmer);
            const prom = txs.main.submitAuditorResult(txs.id, re.defaultResultHash(web3), {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation rejection is already confirmed", async function() {
            const txs = await re.createRejectedHashNoMatchComp(Main, publisher, farmer, web3);
            const prom = txs.main.submitAuditorResult(txs.id, web3.sha3("wrong"), {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation rejection is already rejected", async function(){
            const txs = await re.createRejectedHashMatchComp(Main, publisher, farmer, web3);
            const prom = txs.main.submitAuditorResult(txs.id, re.defaultResultHash(web3), {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if the computation does not exist", async function() {
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);
            const prom = txs.main.submitAuditorResult(1000, re.defaultResultHash(web3), {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("correctly updates the computation status if the hash match", async function() {
            const txs = await re.createRejectedHashMatchComp(Main, publisher, farmer, web3);

            expect(txs.detailsAfterSubmitAuditorResultsTx.status).to.equal("REJECTION_REJECTED");
        });
        it("correctly updates the computation status if the hash do not match", async function() {
            const txs = await re.createRejectedHashNoMatchComp(Main, publisher, farmer, web3);

            expect(txs.detailsAfterSubmitAuditorResultsTx.status).to.equal("REJECTION_CONFIRMED");
        });
        it("emits the correct event if the hash match", async function(){
            const txs = await re.createRejectedHashMatchComp(Main, publisher, farmer, web3);

            expect(txs.submitAuditorResultsTx.logs).to.have.lengthOf(1);
            expect(txs.submitAuditorResultsTx.logs[0].event).to.equal("RejectionRejected");
            expect(txs.submitAuditorResultsTx.logs[0].args.id).to.bignumber.equal(txs.id);
        });
        it("does not emit any event if the hash do not match", async function(){
            const txs = await re.createRejectedHashNoMatchComp(Main, publisher, farmer, web3);

            expect(txs.submitAuditorResultsTx.logs).to.have.lengthOf(0);
        });
        it("transfers all the stake fee to the publisher if the hash do not match", async function() {
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);

            const balBefore = await web3.eth.getBalance(publisher);
            await txs.main.submitAuditorResult(txs.id, web3.sha3("different"), {from: publisher, gasPrice: 0});
            const balAfter = await web3.eth.getBalance(publisher);

            expect(balAfter.minus(balBefore)).to.bignumber.equal(re.defaultMinStakeFee());
        });
        it("does not transfer the stake fee to the publisher if the hash match", async function() {
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);

            const balBefore = await web3.eth.getBalance(publisher);
            await txs.main.submitAuditorResult(txs.id, re.defaultResultHash(web3), {from: publisher, gasPrice: 0});
            const balAfter = await web3.eth.getBalance(publisher);

            expect(balAfter.minus(balBefore)).to.bignumber.equal(0);
        });
    });
};
