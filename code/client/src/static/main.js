
// Defining global contants
const globals = {};
globals.publishSection = document.getElementById("publish");
globals.computationsSection = document.getElementById("comps");
globals.estimateSection = document.getElementById("estimate");

globals.dockerImageInput = document.getElementById("dockername");
globals.weiInput = document.getElementById("wei");
globals.weiStakeFeeInput = document.getElementById("weiStakeFee");
globals.publishInput = document.getElementById("publishComp");
globals.refetchAllBtn = document.getElementById("refetchAll");

globals.computeEstimate = document.getElementById("computeEst");
globals.updateConstants = document.getElementById("updateConstants");

globals.computations = [];

//Not exactly correct from async point of view
fetch("/api/whoami")
    .then(res => res.text())
    .then(text => globals.CLIENT_ADDRESS = text)
    .catch(err => console.log("Error: cannot fetch farmer address"));

//1 gwei = 1 NanoEther
globals.GAS_PRICE_IN_GWEI = 13.631658303;
globals.ETHER_TO_EUR = 615.84;
