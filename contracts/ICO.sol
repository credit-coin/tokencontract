pragma solidity ^0.4.17;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
contract SafeMath {
    function safeMul(uint a, uint b) internal returns (uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function safeDiv(uint a, uint b) internal returns (uint) {
        assert(b > 0);

        uint c = a / b;
        assert(a == b * c + a % b);
        return c;
    }

    function safeSub(uint a, uint b) internal returns (uint) {
        assert(b <= a);
        return a - b;
    }

    function safeAdd(uint a, uint b) internal returns (uint) {
        uint c = a + b;
        assert(c >= a && c >= b);
        return c;
    }
}


/**
 * @title ERC20 interface
 */
contract ERC20 {
    uint public totalSupply;

    function balanceOf(address who) constant returns (uint);

    function allowance(address owner, address spender) constant returns (uint);

    function transfer(address to, uint value) returns (bool ok);

    function transferFrom(address from, address to, uint value) returns (bool ok);

    function approve(address spender, uint value) returns (bool ok);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
    address public owner;

    function Ownable() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) onlyOwner {
        if (newOwner != address(0))
            owner = newOwner;
    }

    function kill() {
        if (msg.sender == owner)
            selfdestruct(owner);
    }

    modifier onlyOwner() {
        if (msg.sender == owner)
            _;
    }
}


/**
 * @title Pausable
 **/
contract Pausable is Ownable {
    bool public stopped;

    event StoppedInEmergency(bool stoppedCampaign);
    event StartedFromEmergency(bool startedCampaign);

    modifier stopInEmergency {
        if (stopped) {
            revert();
        }
        _;
    }

    modifier onlyInEmergency {
        if (!stopped) {
            revert();
        }
        _;
    }

    // Called by the owner in emergency, triggers stopped state
    function emergencyStop() external onlyOwner {
        stopped = true;
        StoppedInEmergency(true);
    }

    // Called by the owner to end of emergency, returns to normal state
    function release() external onlyOwner onlyInEmergency {
        stopped = false;
        StartedFromEmergency(true);
    }
}



// Base contract supporting async send for pull payments.
// Inherit from this contract and use asyncSend instead of send.
contract PullPayment {
    mapping(address => uint) public payments;

    event RefundETH(address to, uint value);

    // Store sent amount as credit to be pulled, called by payer

    function asyncSend(address dest, uint amount) internal {

        payments[dest] += amount;
    }
    // TODO: check
    // Withdraw accumulated balance, called by payee
    function withdrawPayments() internal returns (bool) {
        address payee = msg.sender;
        uint payment = payments[payee];

        if (payment == 0) {
            revert();
        }

        if (this.balance < payment) {
            revert();
        }

        payments[payee] = 0;

        if (!payee.send(payment)) {
            revert();
        }
        RefundETH(payee, payment);
        return true;
    }
}


// Token Contract
contract Token is ERC20, SafeMath, Ownable {
    // Public variables of the token
    string public name;
    string public symbol;
    uint public decimals;
    uint public totalSupply;
    bool public locked;
    address public crowdSaleAddress;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;


    // Lock transfer during the ICO
    modifier onlyUnlocked() {
        if (msg.sender != crowdSaleAddress && locked && msg.sender != owner)
            revert();
        _;
    }

    modifier onlyAuthorized() {
        if (msg.sender != crowdSaleAddress && msg.sender != owner)
            revert();
        _;
    }

    // The Token constructor
    function Token(uint _initialSupply,
        string _tokenName,
        uint _decimalUnits,
        string _tokenSymbol,
        string _version,
        address _crowdSaleAddress) {
        locked = true;
        // Lock the transfer of tokens during the crowdsale
        totalSupply = _initialSupply * (10 ** _decimalUnits);

        name = _tokenName;
        // Set the name for display purposes
        symbol = _tokenSymbol;
        // Set the symbol for display purposes
        decimals = _decimalUnits;
        // Amount of decimals for display purposes
        version = _version;
        crowdSaleAddress = _crowdSaleAddress;
        balances[owner] = 100000 * (10 ** _decimalUnits);
        balances[crowdSaleAddress] = totalSupply - balances[owner];
    }

    function resetCrowdSaleAddress(address _newCrowdSaleAddress) onlyAuthorized() {
        crowdSaleAddress = _newCrowdSaleAddress;
    }

    function unlock() onlyAuthorized {
        locked = false;
    }

    function lock() onlyAuthorized {
        locked = true;
    }

    function burn(address _member, uint256 _value) onlyAuthorized returns (bool) {
        balances[_member] = safeSub(balances[_member], _value);
        totalSupply = safeSub(totalSupply, _value);
        Transfer(_member, 0x0, _value);
        return true;
    }

    function transfer(address _to, uint _value) onlyUnlocked returns (bool) {
        balances[msg.sender] = safeSub(balances[msg.sender], _value);
        balances[_to] = safeAdd(balances[_to], _value);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    /* A contract attempts to get the coins */
    function transferFrom(address _from, address _to, uint256 _value) onlyUnlocked returns (bool success) {
        if (balances[_from] < _value)
            revert();
        // Check if the sender has enough
        if (_value > allowed[_from][msg.sender])
            revert();
        // Check allowance
        balances[_from] = safeSub(balances[_from], _value);
        // Subtract from the sender
        balances[_to] = safeAdd(balances[_to], _value);
        // Add the same to the recipient
        allowed[_from][msg.sender] = safeSub(allowed[_from][msg.sender], _value);
        Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint _value) returns (bool) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }
}
