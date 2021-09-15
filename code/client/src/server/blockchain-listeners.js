const EBus = require("./EventBus");
const Computation = require("./Computation");

module.exports = (MainContract) => {
    MainContract.events.ComputationPublished()
        .on('error', err => EBus.emit("error", err))
        .on('data', evt => {
            EBus.emit("computation-published", {
                id: evt.returnValues.id,
                by: evt.returnValues.publishedBy
            });
        });

    MainContract.events.ComputationAssigned()
        .on('error', err => EBus.emit("error", err))
        .on('data', evt => {
            EBus.emit("computation-assigned", {
                id: evt.returnValues.id,
                to: evt.returnValues.assignedTo
            });
        });

    MainContract.events.ComputationDone()
        .on('error', err => EBus.emit("error", err))
        .on('data', evt => {
            EBus.emit("computation-done", {
                id: evt.returnValues.id
            });
        });

    MainContract.events.ResultAccepted()
        .on('error', err => EBus.emit("error", err))
        .on('data', evt => {
            EBus.emit("computation-results-accepted", {
                id: evt.returnValues.id
            });
        });

    MainContract.events.ResultRejected()
        .on('error', err => EBus.emit("error", err))
        .on('data', evt => {
            EBus.emit("computation-results-rejected", {
                id: evt.returnValues.id
            });
        });

    MainContract.events.ChallengeRIAccepted()
        .on('error', err => EBus.emit("error", err))
        .on('data', evt => {
            EBus.emit("computation-results-challenged", {
                id: evt.returnValues.id
            });
        });

    MainContract.events.RejectionRejected()
        .on('error', err => EBus.emit("error", err))
        .on('data', evt => {
            EBus.emit("computation-results-rejection-rejected", {
                id: evt.returnValues.id
            });
        });
};
