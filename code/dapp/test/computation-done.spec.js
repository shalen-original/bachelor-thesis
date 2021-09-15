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

    describe("computationDone()", async function (){
        it("launches the correct event", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);

            expect(txs.doneTx.logs).to.have.lengthOf(1);
            expect(txs.doneTx.logs[0].event).to.equal("ComputationDone");

            const evt = txs.doneTx.logs[0].args;
            expect(evt.id).to.bignumber.equal(txs.id);
        });
        it("fails if the wrong farmer calls it", async function(){
            const txs = await re.createAssignedComp(Main, publisher, farmer);
            const prom = txs.main.computationDone(txs.id, re.defaultResultHash(web3), re.defaultResultLink(), {from: farmer2, value: re.defaultMinStakeFee()});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if the computation is already done", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const prom = txs.main.computationDone(txs.id, re.defaultResultHash(web3), re.defaultResultLink(), {from: farmer, value: re.defaultMinStakeFee()});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if the computation is not assigned to anyone", async function(){
            const txs = await re.createRequestedComputation(Main, publisher);
            const prom = txs.main.computationDone(txs.id, re.defaultResultHash(web3), re.defaultResultLink(), {from: farmer, value: re.defaultMinStakeFee()});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if a too low stake fee is provided", async function(){
            const txs = await re.createAssignedComp(Main, publisher, farmer);
            const prom = txs.main.computationDone(txs.id, re.defaultResultHash(web3), re.defaultResultLink(), {from: farmer, value: re.defaultMinStakeFee() - 1});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if the computation does not exist", async function(){
            const txs = await re.createAssignedComp(Main, publisher, farmer);
            const prom = txs.main.computationDone(1000, re.defaultResultHash(web3), re.defaultResultLink(), {from: farmer, value: re.defaultMinStakeFee()});

            await expect(prom).not.be.fulfilled;
        });
        it("correctly updates the computation status", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const comp = txs.detailsAfterDoneTx;

            expect(comp.status).to.equal("DONE");
        });
    });
};
