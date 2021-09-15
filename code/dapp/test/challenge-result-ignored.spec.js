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

    describe("challengeResultIgnored()", async function (){
        it("launches the correct event", async function(){
            const txs = await re.createChallengeRIComp(Main, publisher, farmer, web3);

            expect(txs.challengeRITx.logs).to.have.lengthOf(1);
            expect(txs.challengeRITx.logs[0].event).to.equal("ChallengeRIAccepted");
            expect(txs.challengeRITx.logs[0].args.id).to.bignumber.equal(txs.id);
        });
        it("correctly updates the computation status", async function() {
            const txs = await re.createChallengeRIComp(Main, publisher, farmer, web3);

            expect(txs.detailsAfterChallengeRITx.status).to.equal("RESULT_IGNORED");
        });
        it("fails if the wrong farmer tries to challenge", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            const prom = txs.main.challengeResultIgnored(txs.id, {from: farmer2});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is not yet done", async function(){
            const txs = await re.createAssignedComp(Main, publisher, farmer);
            await txs.main.changeChallengeResultIgnoredDuration(0, {from: publisher});
            const prom = txs.main.challengeResultIgnored(txs.id, {from: farmer}) 

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is aleardy accepted", async function(){
            const txs = await re.createAcceptedComp(Main, publisher, farmer, web3);
            await txs.main.changeChallengeResultIgnoredDuration(0, {from: publisher});
            const prom = txs.main.challengeResultIgnored(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails when the computation is already rejected", async function(){
            const txs = await re.createRejectedComp(Main, publisher, farmer, web3);
            await txs.main.changeChallengeResultIgnoredDuration(0, {from: publisher});
            const prom = txs.main.challengeResultIgnored(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if not enough time has passed", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            await txs.main.changeChallengeResultIgnoredDuration(10000, {from: publisher});
            const prom = txs.main.challengeResultIgnored(txs.id, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
        it("fails if the computation does not exist", async function(){
            const txs = await re.createDoneComp(Main, publisher, farmer, web3);
            await txs.main.changeChallengeResultIgnoredDuration(0, {from: publisher});
            const prom = txs.main.challengeResultIgnored(100000, {from: farmer});

            await expect(prom).not.be.fulfilled;
        });
    });
};
