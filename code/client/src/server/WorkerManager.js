const fs = require("fs");
const crypto = require("crypto");
const Docker  = require("dockerode");
const path = require("path");
const config = require("./../config");
const EBus = require("./EventBus");

class WorkerManager {
    
    constructor(MainContract) {
        this.MainContract = MainContract;
        this.docker = new Docker();

        this._onComputationAssigned = this._onComputationAssigned.bind(this);
        this._startComputation = this._startComputation.bind(this);
        this._onImageAvailable = this._onImageAvailable.bind(this);
        this._onContainerStopped = this._onContainerStopped.bind(this);

        this.docker.getEvents({}, (err, data) => {
            if(err){
                console.log(err.message);
                return; 
            }

            data.on('data', chunk => {
                let evt = JSON.parse(chunk.toString('utf8'));

                if (evt.Type === "container" && evt.Action === "die")
                    this._onContainerStopped(evt.Actor.Attributes.name);
            });
        });


        EBus.on("computation-assigned", this._onComputationAssigned);
    }

    _onComputationAssigned(evt){
        // If the computation is not assigned to this farmer
        // nothing has to be done
        if (evt.to.toLowerCase() !== config.client_address)
            return;

        this.MainContract
            .methods
            .getComputationDetails(evt.id)
            .call({from: config.client_address})
            .then(res => {
                return this._startComputation(evt.id, res.dockerImageName);
            }).catch(err => {
                EBus.emit("error", err);
                console.log(err);
            });
    }

    async _startComputation(id, dockerImageName) {
        // Check if image exists locally
        // Yay, filters: https://github.com/apocas/dockerode/issues/196
        let images = await this.docker.listImages({
            "filters": `{"reference": ["${dockerImageName}"]}`
        });        
        
        if (images.length > 0) {
            console.log(`[WM] Image ${dockerImageName} already present locally, skipping download`);
        } else {
            EBus.emit("job-downloading", {id});
            await this.docker.pull(dockerImageName);
        }

        await this._onImageAvailable(id, dockerImageName);
    }

    async _onImageAvailable(id, dockerImageName) {
        //docker run --name daas${id} -d --rm --network="none" --mount type=bind,source=${path},destination=/results ${dockerImageName}
        // Do the computation
        EBus.emit("job-starting", {id});
        let path = await this._mkdirForRes(id);
        let container = await this.docker.createContainer({
            "name": `computation-id-${id}`,
            "Image": dockerImageName,
            "NetworkDisabled": true,
            "HostConfig": {
                "NetworkMode": "none",
                "AutoRemove": true,
                "Mounts": [{
                    "Target": "/results",
                    "Source": path,
                    "Type": "bind"
                }]
            }
        });
        await container.start();
    }

    async _onContainerStopped(name) {
        EBus.emit("job-finished", {id: name.replace("computation-id-", "")});
    }

    _mkdirForRes(id){
        return new Promise((resolve, reject) => {
            let resPath = path.join(config.result.folder, id);
            fs.mkdir(resPath, err => {
                if (err) reject(err);
                resolve(resPath);
            });
        });
    }

}

module.exports = (MainContract) => {
    return new WorkerManager(MainContract);
};
