const path = require("path");
const express = require("express");
const compression = require("compression");

const config = require("../config");
const Computation = require("./Computation");
const EBus = require("./EventBus");

module.exports = (MainContract) => {
    const app = express();

    app.set('port', config.server.port);
    app.use(compression());
    app.use(express.static(path.join(__dirname, '..', 'static')));
    app.use(require('body-parser').json());

    app.get('/', (req, res) => {
        res.sendFile('index.html', {
            root: path.join(__dirname, '..', 'views')
        });
    });

    app.get('/api/computations/:id/perform', (req, res) => {
        MainContract.methods
            .acceptComputation(req.params.id)
            .send({from: config.client_address})
            .then(blockchainResponse => {
                res.status(200).send("Ok");
            }).catch(err => {
                EBus.emit("error", err);
                console.log(err);
                res.status(500).send("Not ok");
            });
    });

    app.get('/api/whoami', (req, res) => {
        res.status(200).send(config.client_address);
    });

    app.get('/api/computations/:id', (req, res) => {
        MainContract.methods
            .getComputationDetails(req.params.id)
            .call({from: config.client_address})
            .then(comp => {
                res.status(200).json(
                    Computation.fromBlockchainCall(req.params.id, comp)
                );
            }).catch(err => {
                EBus.emit("error", err);
                console.log(err);
                res.status(500).send("Error");
            });
    });

    app.get('/api/computations/:id/challenge-farmer-disappeared', (req, res) => {
        MainContract.methods
            .challengeFarmerDisappeared(req.params.id)
            .send({from: config.client_address, gas: 500000})
            .then(tx => {
                res.status(200).send("Ok");
            }).catch(err => {
                EBus.emit("error", err);
                console.log(err);
                res.status(500).send("Error");
            });
    });

    app.get('/api/computations/:id/challenge-result-ignored', (req, res) => {
        MainContract.methods
            .challengeResultIgnored(req.params.id)
            .send({from: config.client_address, gas: 500000})
            .then(tx => {
                res.status(200).send("Ok");
            }).catch(err => {
                EBus.emit("error", err);
                console.log(err);
                res.status(500).send("Error");
            });
    });

    app.get('/api/computations/:id/accept', (req, res) => {
        MainContract.methods
           .acceptResult(req.params.id)
        .send({
            from: config.client_address,
            gas: 500000
        }).then(tx => {
            res.status(200).send("Ok");
        }).catch(err => {
            EBus.emit("error", err);
            console.log(err);
            res.status(500).send("Error");
        });
    });

    app.get('/api/computations/:id/reject', (req, res) => {
        MainContract.methods
           .rejectResult(req.params.id)
        .send({
            from: config.client_address,
            gas: 500000,
            value: config.result.rejection_fee
        }).then(tx => {
            res.status(200).send("Ok");
        }).catch(err => {
            EBus.emit("error", err);
            console.log(err);
            res.status(500).send("Error");
        });
    });

    app.post('/api/computations', (req, res) => {
        MainContract.methods
           .requestComputation(req.body.dockerImage, req.body.minStakeFee)
        .send({
            from: config.client_address,
            gas: 500000,
            value: req.body.weiReward
        }).then(tx => {
            res.status(200).send("Ok");
        }).catch(err => {
            EBus.emit("error", err);
            console.log(err);
            res.status(500).send("Error");
        });
    });

    app.get('/api/computations', (req, res) => {
        let compsId;
        MainContract.getPastEvents("allEvents", {fromBlock: 0})
            .then(evts => {
                let comps = evts
                    .map(el => ({"type": el.event, "id": el.returnValues.id}))
                    .reduce((acc, el) => {
                        if (!acc[el.id])
                            acc[el.id] = [];

                        acc[el.id].push(el.type);
                        return acc;
                    }, {});

                compsId = Object.keys(comps)
                    .filter(key => comps[key].length === 1 && comps[key][0] === "ComputationPublished");

                return Promise.all(
                    compsId.map(id => MainContract.methods.getComputationDetails(id).call({from: config.client_address}))
                );
            }).then(results => {
                let ans = results
                    .map((el,i) => Computation.fromBlockchainCall(compsId[i], el))
                res.status(200).json(ans);
            }).catch(err => {
                EBus.emit("error", err);
                console.log(err);
                res.status(500).send("Error");
            });
    });

    return app;
};
