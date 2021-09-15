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

    describe("acceptResult()", async function (){
        it("launches the correct event", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);

            expect(txs.acceptTx.logs).to.have.lengthOf(1);
            expect(txs.acceptTx.logs[0].event).to.equal("ResultAccepted");

            expect(txs.acceptTx.logs[0].args.id).to.bignumber.equal(txs.id);
        });
        it("fails if the computation does not exist", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const prom = txs.main.acceptResult(1000, {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if someone that is not the publisher tries to accept the result", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const prom = txs.main.acceptResult(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is not done", async function(){
            const txs = await re.createAssignedComp(Main, publisher, farmer);
            const prom = txs.main.acceptResult(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is already accepted", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const prom = txs.main.acceptResult(txs.id, {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is already rejected", async function(){
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);
            const prom = txs.main.acceptResult(txs.id, {from: publisher});

            await expect(prom).not.be.fulfilled;
        });
        it("correctly updates the computation status", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const comp = txs.detailsAfterAcceptTx;
            
            expect(comp.status).to.equal("ACCEPTED");
        });
    });
};
