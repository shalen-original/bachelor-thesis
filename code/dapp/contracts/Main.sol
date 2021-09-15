pragma solidity 0.4.24;

import "./Administrable.sol";

contract Main is Administrable {
    uint CHALLENGE_RESULT_IGNORED_DURATION = 5;       // Seconds
    uint CHALLENGE_FARMER_DISAPPEARED_DURATION = 5;   // Seconds

    uint private lastRequestedId;
    mapping (uint => Computation) private computations;

    event ComputationPublished(address publishedBy, uint id); 
    event ComputationAssigned(address assignedTo, uint id);
    event ComputationDone(uint id);
    event ResultAccepted(uint id);
    event ResultRejected(uint id);
    event ChallengeRIAccepted(uint id);
    event RejectionRejected(uint id);

    enum Status {CREATED, ASSIGNED, DONE, ACCEPTED, WITHDRAWN, REJECTED, REJECTION_CONFIRMED, RESULT_IGNORED, REJECTION_REJECTED}

    struct Computation{ 
        Status status; 

        address publisher; 
        string dockerImageName; 
        uint weiReward;
        uint minStakeFee;

        address assignedTo;
        uint assignationTimestamp;

        uint stakeFee;
        bytes32 resultHash;
        string resultLink;
        uint resultSubmissionTimestamp;

        uint auditFee;
   }

    constructor() public { lastRequestedId = 0;}

    //-------------
    // COMPUTATION
    //-------------

    function requestComputation(string dockerImageName, uint minStakeFee) public payable {
        uint newId = lastRequestedId;
        lastRequestedId++;

        computations[newId] = Computation(Status.CREATED, msg.sender, dockerImageName, msg.value, minStakeFee, address(0), 0, 0, 0, "", 0, 0);
        emit ComputationPublished(msg.sender, newId);
    }

    function getComputationDetails(uint id) public view returns(Status status, address publisher, string dockerImageName, uint weiReward, uint minStakeFee, address assignedTo, uint assignationTimestamp, uint stakeFee, bytes32 resultHash, string resultLink, uint resultSubmissionTimestamp, uint auditFee){
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        return (c.status, c.publisher, c.dockerImageName, c.weiReward, c.minStakeFee, c.assignedTo, c.assignationTimestamp, c.stakeFee, c.resultHash, c.resultLink, c.resultSubmissionTimestamp, c.auditFee);
    }

    function acceptComputation(uint id) public {
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        require(c.status == Status.CREATED, "The computation with the given ID is not in the correct status for this operation");

        c.assignedTo = msg.sender;
        c.assignationTimestamp = block.timestamp;
        c.status = Status.ASSIGNED;

        emit ComputationAssigned(msg.sender, id);
    }

    function computationDone(uint id, bytes32 resHash, string resLink) public payable{
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        require(c.status == Status.ASSIGNED, "The computation with the given ID is not in the correct status for this operation");
        require(c.assignedTo == msg.sender, "Only the one to which the computation was assigned can submit the results");
        require(msg.value >= c.minStakeFee, "The stake amount is too low");

        c.resultHash = resHash;
        c.resultLink = resLink;
        c.resultSubmissionTimestamp = block.timestamp;
        c.stakeFee = msg.value;
        c.status = Status.DONE;

        emit ComputationDone(id);
    }

    function acceptResult(uint id) public {
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        require(c.status == Status.DONE, "The computation with the given ID is not in the correct status for this operation");
        require(c.publisher == msg.sender, "Only the publisher can accept the results of a computation");

        c.status = Status.ACCEPTED;

        emit ResultAccepted(id);
    }

    function rejectResult(uint id) public payable {
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        require(c.status == Status.DONE, "The computation with the given ID is not in the correct status for this operation");
        require(c.publisher == msg.sender, "Only the publisher can reject the results of a computation");

        c.auditFee = msg.value;
        c.status = Status.REJECTED;

        emit ResultRejected(id);
    }

    function withdrawReward(uint id) public {
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        require(c.status == Status.ACCEPTED || c.status == Status.RESULT_IGNORED || c.status == Status.REJECTION_REJECTED, "The computation with the given ID is not in the correct status for this operation");
        require(c.assignedTo == msg.sender, "Only the assigned farmer can retrieve the reward");

        c.status = Status.WITHDRAWN;
        msg.sender.transfer(c.weiReward);
        msg.sender.transfer(c.stakeFee);
    } 

    //-------------
    // CHALLENGES (alternative flows)
    //-------------

    function challengeFarmerDisappeared(uint id) public {
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        require(c.status == Status.ASSIGNED, "The computation with the given ID is not in the correct status for this operation");
        require(c.assignedTo != msg.sender, "Only a farmer different than the one to which this computation is assigned can challenge for result ignored");

        uint duration = block.timestamp - c.assignationTimestamp;
        require(duration >= CHALLENGE_FARMER_DISAPPEARED_DURATION, "Not enough time has passed");

        c.assignedTo = msg.sender;
        c.assignationTimestamp = block.timestamp;

        emit ComputationAssigned(msg.sender, id);
    }

    function challengeResultIgnored(uint id) public {
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        require(c.status == Status.DONE, "The computation with the given ID is not in the correct status for this operation");
        require(c.assignedTo == msg.sender, "Only the farmer to which this computation is assigned can challenge for result ignored");

        uint duration = block.timestamp - c.resultSubmissionTimestamp;
        require(duration >= CHALLENGE_RESULT_IGNORED_DURATION, "Not enough time has passed");

        c.status = Status.RESULT_IGNORED;

        emit ChallengeRIAccepted(id);
    }

    function submitAuditorResult(uint id, bytes32 hash) public auditor {
        Computation storage c = computations[id];
        require(c.publisher != address(0), "A computation with the given ID does not exist");
        require(c.status == Status.REJECTED, "The computation with the given ID is not in the correct status for this operation");

        if (c.resultHash == hash) {
            // Farmer was honest, publisher rejected a correct result
            c.status = Status.REJECTION_REJECTED;
            emit RejectionRejected(id);
        } else {
            // Farmer was dishonest.
            // Transfer the stake fee to the publisher,
            // as a compensation for the incident
            c.publisher.transfer(c.stakeFee);
            c.status = Status.REJECTION_CONFIRMED;
        }
    }

    //----------
    // ADMIN
    //---------

    function changeChallengeResultIgnoredDuration(uint newDuration) public administrative {
        CHALLENGE_RESULT_IGNORED_DURATION = newDuration;
    }

    function changeChallengeFarmerDisappearedDuration(uint newDuration) public administrative {
        CHALLENGE_FARMER_DISAPPEARED_DURATION = newDuration;
    }

}
