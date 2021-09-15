const config = require("./../config");
const EBus = require("./EventBus");

class WithdrawalManager{

    constructor(MainContract) {
        this.MainContract = MainContract;

        this._onResultAccepted = this._onResultAccepted.bind(this);

        EBus.on("computation-results-accepted", this._onResultAccepted);
        EBus.on("computation-results-challenged", this._onResultAccepted);
        EBus.on("computation-results-rejection-rejected", this._onResultAccepted);
    }

    _onResultAccepted(evt) {
        this.MainContract
            .methods
            .getComputationDetails(evt.id)
            .call({from: config.client_address})
            .then(res => {
                if (res.assignedTo.toLowerCase() !== config.client_address)
                    return null;

                return this.
                        MainContract
                        .methods
                        .withdrawReward(evt.id)
                        .send({from: config.client_address})
            }).then(res => {
                if (res)
                    EBus.emit("withdrawn", {id: evt.id});
            }).catch(err => {
                EBus.emit("error", err);
                console.log(err);
            });
    }

}

module.exports = (MainContract) => {
    return new WithdrawalManager(MainContract);
};
