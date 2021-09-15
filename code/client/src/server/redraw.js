const path = require("path");
const fs = require("fs");

module.exports = (app) => {

    const importGasPrices = () => {
        const csv = fs.readFileSync('export-AvgGasPrice.csv').toString().replace(/\r/g, "").split("\n");
        csv.shift(); // Remove headings
        csv.pop(); // Remove last (empty) line

        const ans = {};

        csv.forEach(line => {
            const pieces = line.split(",");
            const date = new Date(pieces[1].replace(/"/g, "") * 1000);

            // Pick only from 01/02/2018 onwards to avoid cryptokitties spike
            if (date < (new Date("2018", "01", "01")))
                return;

            const dateName = date.toISOString().substring(0, 10);
            const price = (+pieces[2].replace(/"/g, "")) * Math.pow(10, -9);
            ans[dateName] = price;
        });

        return ans;
    }

    const importEtherToEurConversionRates = () => {
        const csv = fs.readFileSync('eth-eur-max.csv').toString().replace(/\r/g, "").split("\n");
        csv.shift(); // Remove headings
        csv.pop(); // Remove last (empty) line

        const ans = {};

        csv.forEach(line => {
            const pieces = line.split(",");
            const date = pieces[0].substring(0, 10);

            // Pick only from 01/02/2018 onwards to avoid cryptokitties spike
            console.log(`${date.substring(0, 4)}-${date.substring(5, 7)}-${date.substring(8, 10)}`);
            const dateObj = new Date(date.substring(0, 4), (+date.substring(5, 7)) - 1, date.substring(8, 10));
            if (dateObj < (new Date("2018", "01", "01")))
                return;

            const conv = (+pieces[1].replace(/"/g, ""));
            ans[date] = conv;
        });

        return ans;
    }

    app.get('/api/redraw', (req, res) => {
        const gasPrices = importGasPrices();
        const ethToEurConvs = importEtherToEurConversionRates();

        const GAS_PRICE_GWEI = Object.values(gasPrices).reduce((acc, el) => acc + el) / Object.values(gasPrices).length;
        const ETH_TO_EUR = Object.values(ethToEurConvs).reduce((acc, el) => acc + el) / Object.values(ethToEurConvs).length;

        const gases = {
            "requestComputation": 138757,
            "acceptComputation": 69544,
            "computationDone": 113299,
            "acceptResult": 29141,
            "withdrawReward": 43498,
            "rejectResult": 49312,
            "submitAuditorResult": 38551,
            "challengeFarmerDisappeared": 34816,
            "challengeResultIgnored": 29503
        };

        const ans = { tables: {}, graphs:{} };
        ans.GAS_PRICE_GWEI = GAS_PRICE_GWEI;
        ans.ETH_TO_EUR = ETH_TO_EUR;

        let tmp;

        //Currency prices
        const gasToGWei = gas => gas * GAS_PRICE_GWEI;
        const gasToEur = gas => gasToGWei(gas) * ETH_TO_EUR * Math.pow(10, -9);

        //Writing table "method costs"
        ans.tables.methodCosts = "";
        Object.keys(gases).forEach(el => {
            ans.tables.methodCosts += `${el} & ${gases[el]} & ${gasToGWei(gases[el]).toFixed(2)} & ${gasToEur(gases[el]).toFixed(2)} \\ `;
        });

        //Writing table "standard scenario"
        ans.tables.standardScenario = "";
        tmp = {
            Publisher: gases.requestComputation + gases.acceptResult,
            Farmer: gases.acceptComputation + gases.computationDone + gases.withdrawReward,
            Auditor: 0,
            Total: gases.requestComputation + gases.acceptResult + gases.acceptComputation + gases.computationDone + gases.withdrawReward
        };
        Object.keys(tmp).forEach(el => ans.tables.standardScenario += `${el} & ${tmp[el]} & ${gasToGWei(tmp[el]).toFixed(2)} & ${gasToEur(tmp[el]).toFixed(2)} \\ `);

        //Writing table "auditor scenario"
        ans.tables.auditorScenario = "";
        tmp = {
            Publisher: gases.requestComputation + gases.rejectResult,
            Farmer: gases.acceptComputation + gases.computationDone,
            Auditor: gases.submitAuditorResult,
            Total: gases.requestComputation + gases.rejectResult + gases.acceptComputation + gases.computationDone + gases.submitAuditorResult
        };
        Object.keys(tmp).forEach(el => ans.tables.auditorScenario += `${el} & ${tmp[el]} & ${gasToGWei(tmp[el]).toFixed(2)} & ${gasToEur(tmp[el]).toFixed(2)} \\ `);

        //Writing table "contract deployments"
        ans.tables.contractDeployments = "";
        tmp = {
            Migrations: 319470,
            Main: 3158630,
        };
        tmp.Total = tmp.Migrations + tmp.Main;
        Object.keys(tmp).forEach(el => ans.tables.contractDeployments += `${el} & ${tmp[el]} & ${gasToGWei(tmp[el]).toFixed(2)} & ${gasToEur(tmp[el]).toFixed(2)} \\ `);


        //
        // Writing graph "gasPrice"
        ans.graphs.gasPrice = "";
        Object.keys(gasPrices).forEach(key => ans.graphs.gasPrice += `(${key}, ${gasPrices[key].toFixed(2)}) `);

        // Writing graph "Eth to eur"
        ans.graphs.ethToEur = "";
        Object.keys(ethToEurConvs).forEach(key => ans.graphs.ethToEur += `(${key}, ${ethToEurConvs[key].toFixed(2)}) `);

        // Writing graph "Standard scenario cost"
        ans.graphs.standardScenario = "";
        tmp = gases.requestComputation + gases.acceptResult + gases.acceptComputation + gases.computationDone + gases.withdrawReward;
        Object.keys(gasPrices).forEach(key => ans.graphs.standardScenario += `(${key}, ${(tmp * gasPrices[key] * ethToEurConvs[key] * Math.pow(10, -9)).toFixed(2)}) `);



        console.log(JSON.stringify(ans, null, 1));
        res.status(200).json(ans);
    });
};
