const process = require("process");

if (process.argv.length < 3)
    module.exports = require("./config-dev.json");
else
    module.exports = require("./" + process.argv[2]);
