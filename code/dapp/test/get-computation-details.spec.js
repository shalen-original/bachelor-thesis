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

    describe("getComputationDetails()", async function (){
        it("allows retrieving the informations of a published computation", async function() {
            const txs = await re.createWithdrawnComp(Main, publisher, farmer, web3);
            const comp = txs.detailsAfterWithdrawnTx;

            expect(comp.status).to.equal("WITHDRAWN");

            expect(comp.publisher).to.equal(publisher);
            expect(comp.dockerImageName).to.equal(re.defaultDockerImageName());
            expect(comp.weiReward).to.bignumber.equal(re.defaultWeiReward());
            expect(comp.minStakeFee).to.bignumber.equal(re.defaultMinStakeFee());

            expect(comp.assignedTo).to.equal(farmer);
            expect(comp.assignationTimestamp).to.bignumber.not.equal(0);

            expect(comp.stakeFee).to.bignumber.equal(re.defaultMinStakeFee());
            expect(comp.resultHash).to.equal(re.defaultResultHash(web3));
            expect(comp.resultLink).to.equal(re.defaultResultLink());
            expect(comp.resultSubmissionTimestamp).to.bignumber.not.equal(0);

            expect(comp.auditFee).to.bignumber.equal(0); // Computation is not rejected
        });
        it("throws when requesting a published computation that does not exists", async function() {
            let main = await Main.deployed();
            let det = main.getComputationDetails(100, {from: publisher});

            await expect(det).not.be.fulfilled;
        });
    });
};
