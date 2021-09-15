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

    describe("challengeFarmerDisappeared()", async function (){
        it("launches the correct event", async function(){
            const txs = await re.createAssignedComp(Main, publisher, farmer, web3);
            const changeTimeout = await txs.main.changeChallengeFarmerDisappearedDuration(0, {from: publisher});
            const challengeTx = await txs.main.challengeFarmerDisappeared(txs.id, {from: farmer2});

            expect(challengeTx.logs).to.have.lengthOf(1);
            expect(challengeTx.logs[0].event).to.equal("ComputationAssigned");
            expect(challengeTx.logs[0].args.id).to.bignumber.equal(txs.id);
        });
        it("fails if the computation is already assigned to the challenger", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const changeTimeout = await txs.main.changeChallengeFarmerDisappearedDuration(0, {from: publisher});
            const prom = txs.main.challengeFarmerDisappeared(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is already done", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const changeTimeout = await txs.main.changeChallengeFarmerDisappearedDuration(0, {from: publisher});
            const prom = txs.main.challengeFarmerDisappeared(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if not enough time has passed", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const changeTimeout = await txs.main.changeChallengeFarmerDisappearedDuration(1000000, {from: publisher});
            const prom = txs.main.challengeFarmerDisappeared(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if the computation does not exist", async function() {
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            const changeTimeout = await txs.main.changeChallengeFarmerDisappearedDuration(0, {from: publisher});
            const prom = txs.main.challengeFarmerDisappeared(10000, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("correctly assigns the computation to the challenger", async function() {
            const txs = await re.createAssignedComp(Main, publisher, farmer, web3);
            const changeTimeout = await txs.main.changeChallengeFarmerDisappearedDuration(0, {from: publisher});
            const challengeTx = await txs.main.challengeFarmerDisappeared(txs.id, {from: farmer2});
            const comp = new Computation(await txs.main.getComputationDetails(txs.id));

            expect(comp.assignedTo).to.equal(farmer2);
        });
    });
};
