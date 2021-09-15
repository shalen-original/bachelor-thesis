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

    describe("withdrawReward()", async function (){
        it("fails if the wrong farmer tries to get the money", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const prom = txs.main.withdrawReward(txs.id, {from: farmer2});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is not accepted nor rejected", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const prom = txs.main.withdrawReward(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is rejected", async function(){
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);
            const prom = txs.main.withdrawReward(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if the reward has already been withdrawn", async function(){
            const txs = await re.createWithdrawnComp(Main, publisher, farmer, web3);
            const prom = txs.main.withdrawReward(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if the computation does not exist", async function() {
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const prom = txs.main.withdrawReward(1000, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("sends 'weiReward + stakeFee' as reward", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);

            let balanceBefore = await web3.eth.getBalance(farmer);
            await txs.main.withdrawReward(txs.id, {from: farmer, gasPrice: 0});
            let balanceAfter = await web3.eth.getBalance(farmer);

            expect(balanceAfter.minus(balanceBefore)).to.bignumber.equal(re.defaultWeiReward() + re.defaultMinStakeFee());
        });
        it("correctly updates the computation status", async function(){
            const txs = await re.createWithdrawnComp(Main, publisher, farmer, web3);

            expect(txs.detailsAfterWithdrawnTx.status).to.equal("WITHDRAWN");
        });
    });
};
