const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = require("chai").expect;
const Main = artifacts.require("Main");

contract("Main", async function (accounts) {
    require("./request-computation.spec.js")(accounts, Main);
    require("./get-computation-details.spec.js")(accounts, Main);
    require("./accept-computation.spec.js")(accounts, Main);
    require("./computation-done.spec.js")(accounts, Main);
    require("./accept-result.spec.js")(accounts, Main);
    require("./reject-result.spec.js")(accounts, Main);
    require("./withdraw-reward.spec.js")(accounts, Main);
    require("./challenge-farmer-disappeared.spec.js")(accounts, Main);
    require("./challenge-result-ignored.spec.js")(accounts, Main);
    require("./submit-auditor-result.spec.js")(accounts, Main);
});
