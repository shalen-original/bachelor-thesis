class Computation{

    constructor(call){
        this.status = this._translateStatus(call[0]);

        this.publisher = call[1]; 
        this.dockerImageName = call[2]; 
        this.weiReward = call[3];
        this.minStakeFee = call[4];

        this.assignedTo = call[5];
        this.assignationTimestamp = call[6];

        this.stakeFee = call[7];
        this.resultHash = call[8];
        this.resultLink = call[9];
        this.resultSubmissionTimestamp = call[10];

        this.auditFee = call[11];
    }

    _translateStatus(number){
        const statuses = [
            "CREATED", "ASSIGNED",
            "DONE", "ACCEPTED",
            "WITHDRAWN", "REJECTED",
            "REJECTION_CONFIRMED",
            "RESULT_IGNORED", "REJECTION_REJECTED"
        ];
        return statuses[number];
    }
}

module.exports = Computation;
