const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");

const config = require("./../config");
const EBus = require("./EventBus");
const Computation = require("./Computation");

class UploadManager {
    
    constructor(MainContract, web3) {
        this.MainContract = MainContract;
        this.web3 = web3;

        this._onJobFinished = this._onJobFinished.bind(this);
        this._zipFolder = this._zipFolder.bind(this);
        this._uploadFile = this._uploadFile.bind(this);
        this._fetchMinStakeFee = this._fetchMinStakeFee.bind(this);

        EBus.on("job-finished", this._onJobFinished);
    }

    _onJobFinished(evt){
        const outputFile = path.join(config.result.folder, evt.id + ".zip");
        this
            ._zipFolder(path.join(config.result.folder, evt.id), outputFile)
            .then(() => {
                return Promise.all([this._uploadFile(outputFile), this._hashFile(outputFile), this._fetchMinStakeFee(evt.id)]);
            }).then(res => {
                const link = res[0];
                const hash = [...res[1]];
                const minStakeFee = res[2];

                return this.MainContract
                    .methods
                    .computationDone(evt.id, this.web3.utils.bytesToHex(hash), link)
                    .send({from: config.client_address, gas:5000000, value: minStakeFee})
            }).then(tx => {
                EBus.emit("job-results-uploaded", {id: evt.id});
                return Promise.all([fs.remove(outputFile), fs.remove(path.join(config.result.folder, evt.id))]);
            }).catch((err) => {
                console.log("Error:" + err);
                EBus.emit("error", {err});
            });

    }

    _zipFolder(folderPath, outputPath){
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', {zlib: { level: 9 }});

            // listen for all archive data to be written
            // 'close' event is fired only when a file descriptor is involved
            output.on('close', function() {
                resolve();
            });

            archive.on('warning', reject);
            archive.on('error', reject);

            archive.pipe(output);

            archive.directory(folderPath, false);
            archive.finalize();
        });
    }

    _uploadFile(filePath){
        return new Promise((resolve, reject) => {
            //Simulate upload
            setTimeout(() => resolve("http://my.s3.bucket/fE6kT0S"), 500);
        });
    }

    _hashFile(filePath){
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = fs.ReadStream(filePath);

            stream.on('data', data => hash.update(data));
            stream.on('end', () => resolve(hash.digest()));
        });
    }

    async _fetchMinStakeFee(id){
        const tx = await this.MainContract.methods
            .getComputationDetails(id)
            .call({from: config.client_address});

        const comp = Computation.fromBlockchainCall(id, tx);
        return comp.minStakeFee;
    }

}

module.exports = (MainContract, web3) => {
    return new UploadManager(MainContract, web3);
};
