class Computation{
    
    static fromBlockchainCall(id, callResult){
        let ans = new Computation(id);
        for (let k in callResult){
            if (isNaN(k))
                ans[k] = callResult[k];
        }

        const statuses = [
            "CREATED", "ASSIGNED", "DONE", "ACCEPTED", 
            "WITHDRAWN", "REJECTED", "REJECTION_CONFIRMED", 
            "RESULT_IGNORED", "REJECTION_REJECTED"
        ];
        ans.status = statuses[ans.status];

        return ans;
    }

    constructor(id){
        this.id = id;
    }
}

module.exports = Computation;
