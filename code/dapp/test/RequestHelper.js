const Computation = require("./Computation.js")

class RequestHelper{

    static defaultDockerImageName() { return "my-docker-repo/test-image:dev"; }
    static defaultMinStakeFee() { return 500; }
    static defaultWeiReward() { return 1000; }
    static defaultResultHash(web3) { return web3.sha3("string"); }
    static defaultResultLink() { return "link"; }
    static defaultAuditFee() { return 2000; }

    static async createRequestedComputation(Main, publisher){
        const paymentDetails = {from: publisher, value: RequestHelper.defaultWeiReward()};

        const main = await Main.deployed();
        const publishTx = await main.requestComputation(RequestHelper.defaultDockerImageName(), RequestHelper.defaultMinStakeFee(), paymentDetails);
        const id = publishTx.logs[0].args.id;
        const detailsAfterPublishTx = new Computation(await main.getComputationDetails(id));

        return {main, id, publishTx, detailsAfterPublishTx};
    }

    static async createAssignedComp(Main, publisher, farmer){
        const txs = await RequestHelper.createRequestedComputation(Main, publisher);
        txs.acceptTx = await txs.main.acceptComputation(txs.id, {from: farmer});
        txs.detailsAfterAcceptTx = new Computation(await txs.main.getComputationDetails(txs.id));

        return txs;
    }

    static async createDoneComp(Main, publisher, farmer, web3){
        const txs = await RequestHelper.createAssignedComp(Main, publisher, farmer);
        txs.doneTx = await txs.main.computationDone(txs.id, RequestHelper.defaultResultHash(web3), RequestHelper.defaultResultLink(), {from: farmer, value: RequestHelper.defaultMinStakeFee()});
        txs.detailsAfterDoneTx = new Computation(await txs.main.getComputationDetails(txs.id));

        return txs;
    }

    static async createAcceptedComp(Main, publisher, farmer, web3){
        const txs = await RequestHelper.createDoneComp(Main, publisher, farmer, web3);
        txs.acceptTx = await txs.main.acceptResult(txs.id, {from: publisher});
        txs.detailsAfterAcceptTx = new Computation(await txs.main.getComputationDetails(txs.id));

        return txs;
    }

    static async createRejectedComp(Main, publisher, farmer, web3){
        const txs = await RequestHelper.createDoneComp(Main, publisher, farmer, web3);
        txs.rejectTx = await txs.main.rejectResult(txs.id, {from: publisher, value: RequestHelper.defaultAuditFee()});
        txs.detailsAfterRejectTx = new Computation(await txs.main.getComputationDetails(txs.id));

        return txs;
    }

    static async createWithdrawnComp(Main, publisher, farmer, web3){
        const txs = await RequestHelper.createAcceptedComp(Main, publisher, farmer, web3);
        txs.withdrawnTx = await txs.main.withdrawReward(txs.id, {from: farmer});
        txs.detailsAfterWithdrawnTx = new Computation(await txs.main.getComputationDetails(txs.id));

        return txs;
    }

    static async createChallengeRIComp(Main, publisher, farmer, web3){
        const txs = await RequestHelper.createDoneComp(Main, publisher, farmer, web3);
        await txs.main.changeChallengeResultIgnoredDuration(0, {from: publisher});
        txs.challengeRITx = await txs.main.challengeResultIgnored(txs.id, {from: farmer});
        txs.detailsAfterChallengeRITx = new Computation(await txs.main.getComputationDetails(txs.id));

        return txs;
    }

    static async createRejectedHashNoMatchComp(Main, publisher, farmer, web3){
        const txs = await RequestHelper.createRejectedComp(Main, publisher, farmer, web3);
        txs.submitAuditorResultsTx = await txs.main.submitAuditorResult(txs.id, web3.sha3("wrong"), {from: publisher});
        txs.detailsAfterSubmitAuditorResultsTx = new Computation(await txs.main.getComputationDetails(txs.id));

        return txs;
    }

    static async createRejectedHashMatchComp(Main, publisher, farmer, web3){
        const txs = await RequestHelper.createRejectedComp(Main, publisher, farmer, web3);
        txs.submitAuditorResultsTx = await txs.main.submitAuditorResult(txs.id, RequestHelper.defaultResultHash(web3), {from: publisher});
        txs.detailsAfterSubmitAuditorResultsTx = new Computation(await txs.main.getComputationDetails(txs.id));

        return txs;
    }

}

module.exports = RequestHelper;
