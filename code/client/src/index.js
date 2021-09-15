/*
 *  This is the orchestrator module, to be run by the farmer. This module listens for
 *  events published by the dapp and chooses if this farmer should try to execute that
 *  computation.
 */

const Web3 = require("web3");
const http = require("http");
const WebSocket = require("ws");

const config = require("./config");
const mainContractAbi = require("./abi/Main.json").abi;
const ClientEQueue = require("./server/WsEventQueue");

console.log("Client module");
console.log("Welcome, let's have a jolly cooperation!\n");

console.log("Running with configuration: ");
console.log(JSON.stringify(config, null, 1));


console.log("Configuring the web3 instance...");
const web3Provider = new Web3.providers.WebsocketProvider(config.eth_node_url, {
    headers: { Origin: config.eth_node_declared_origin }
});
const web3 = new Web3(web3Provider);
const MainContract = new web3.eth.Contract(mainContractAbi, config.dapp_address);


console.log("Registering web3 listeners for events...");
require("./server/blockchain-listeners")(MainContract);


console.log("Configuring worker...");
require("./server/WorkerManager")(MainContract);

console.log("Configuring uploader...");
require("./server/UploadManager")(MainContract, web3);

console.log("Configuring withdrawer...");
require("./server/WithdrawalManager")(MainContract);


console.log("Configuring Express server...");
const app = require("./server/create-express-app")(MainContract);
require("./server/redraw")(app);
app.get('/api/estimate', (req, res) => {
    estimate()
    .then(j => res.status(200).json(j))
    .catch(err => {
        console.log(err);
        res.status(500).send("Error")
    });
});

const estimate = async () => {
    const ms = MainContract.methods;
    const delay = ms => new Promise((res, rej) => setTimeout(res, ms));
    const cl = msg => console.log(`[${new Date()}] ${msg}`);
    const opts = {from: "0x69fb7cbf7176db8532e6269cd23407fe807b85bf", gas: 500000};
    const optsAlt = {from: "0x0b85b8d99c7f92dd6ef8d8891b00937c74fe8e40", gas: 500000};
    const ans = {};

    let id;

    const begin = Date.now();
    console.log("\n---------------------------------");
    cl("Begun computing estimates");

    // Happy path
    cl("Estimating happy path.");
    const txReqComp1 = await ms.requestComputation("EstimateDockerImageHappyFlow", 0).send({...opts, value:1})
    id = txReqComp1.events.ComputationPublished.returnValues.id;
    const txAccComp1 = await ms.acceptComputation(id).send(opts);
    const txCompDon1 = await ms.computationDone(id, web3.utils.sha3("string"), "link").send({...opts, value:1});
    const txAccResu1 = await ms.acceptResult(id).send(opts);
    const txWithRew1 = await ms.withdrawReward(id).send(opts);

    //Auditor path
    cl("Estimating auditor path.");
    const txReqComp2 = await ms.requestComputation("EstimateDockerImageAuditor", 0).send({...opts, value:1})
    id = txReqComp2.events.ComputationPublished.returnValues.id;
    const txAccComp2 = await ms.acceptComputation(id).send(opts);
    const txCompDon2 = await ms.computationDone(id, web3.utils.sha3("string"), "link").send({...opts, value:1});
    const txRejResu2 = await ms.rejectResult(id).send({...opts, value:1});
    const txSubAudR2 = await ms.submitAuditorResult(id, web3.utils.sha3("farmer-is-wrong")).send({from: "0x1278f3a10edd6725a69e4a47bf7889c887ad479f"}); //Owner
    
    // Challenges path
    cl("Estimating challenges path.");
    const txReqComp3 = await ms.requestComputation("EstimateDockerChallenges", 0).send({...opts, value:1})
    id = txReqComp3.events.ComputationPublished.returnValues.id;
    const txAccComp3 = await ms.acceptComputation(id).send(opts);
    await delay(7000);
    const txChallFD3 = await ms.challengeFarmerDisappeared(id).send(optsAlt);
    const txCompDon3 = await ms.computationDone(id, web3.utils.sha3("string"), "link").send(optsAlt);
    await delay(7000);
    const txChallRI3 = await ms.challengeResultIgnored(id).send(optsAlt);
    const txWithRew3 = await ms.withdrawReward(id).send(optsAlt);

    //Gases
    ans.requestComputation  = txReqComp1.gasUsed;
    ans.acceptComputation   = txAccComp1.gasUsed;
    ans.computationDone     = txCompDon1.gasUsed;
    ans.acceptResult        = txAccResu1.gasUsed;
    ans.withdrawReward      = txWithRew1.gasUsed;

    ans.rejectResult        = txRejResu2.gasUsed;
    ans.submitAuditorResult = txSubAudR2.gasUsed;

    ans.challengeFarmerDisappeared = txChallFD3.gasUsed;
    ans.challengeResultIgnored     = txChallRI3.gasUsed;


    cl(`Done (${(Date.now() - begin) / 1000}s). Results:`);
    console.log(JSON.stringify(ans, null, 1));
    console.log("---------------------------------\n");

    return ans;
};


console.log("Starting server...");
const server = http.createServer(app);
const wss = new WebSocket.Server({server});
wss.on('connection', ws => ClientEQueue.initClient(ws));

server.listen(app.get('port'), () => {
    console.log(`Server configured and started. Listening on port ${app.get('port')}.`);
});
