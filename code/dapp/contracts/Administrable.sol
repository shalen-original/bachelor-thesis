pragma solidity 0.4.24;

contract Administrable {
    address private owner;

    constructor() public { 
        owner = msg.sender; 
    }

    function getOwner() public view returns (address){ 
        return owner; 
    }

    function shutdown() public administrative {
        selfdestruct(owner);
    }

    modifier administrative{
        require(msg.sender == owner, "Only a priviledge user can perform this action");
        _;
    }

    modifier auditor{
        require(msg.sender == owner, "Only an authorized auditor can perform this action");
        _;
    }

}
