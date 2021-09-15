const EBus = require("./EventBus");

class WsEventQueue {

    constructor() {
        this._backlog = [];
        this._client = null;

        this._addToBacklog = this._addToBacklog.bind(this);
        this._clearBacklog = this._clearBacklog.bind(this);

        const interestingEvts = [
            "computation-published", "computation-assigned", "computation-done", 
            "computation-results-accepted", "computation-results-rejected", 
            "computation-results-challenged", "computation-results-rejection-rejected", "withdrawn", 
            "job-downloading", "job-starting", "job-finished" 
        ];

        interestingEvts.forEach(evtName => {
            EBus.on(evtName, evt => this._addToBacklog(evtName, {id: evt.id}));
        });

    }

    initClient(ws){
        this._client = ws;
        this._clearBacklog();
    }

    _addToBacklog(type, data){
        this._backlog.push({type, data});
        this._clearBacklog();
    }

    _clearBacklog(){
        if (!this._client)
            return;

        this._backlog.forEach(evt => {
            this._client.send(JSON.stringify(evt));
        });

        this._backlog = [];
    }
};

module.exports = new WsEventQueue();
