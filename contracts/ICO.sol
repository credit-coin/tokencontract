pragma solidity ^0.4.17;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
contract SafeMath {
    function safeMul(uint a, uint b) internal returns (uint) {
        if (a == 0) {
            return 0;
        }
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function safeDiv(uint a, uint b) internal returns (uint) {
        return a / b;
    }

    function safeSub(uint a, uint b) internal returns (uint) {
        assert(b <= a);
        return a - b;
    }

    function safeAdd(uint a, uint b) internal returns (uint) {
        uint c = a + b;
        assert(c >= a);
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


// Crowdsale Smart Contract
// This smart contract collects ETH and in return sends tokens to the Backers
contract Crowdsale is SafeMath, Pausable, PullPayment {

    struct Backer {
        uint weiReceived; // amount of ETH contributed
        uint tokensSent; // amount of tokens sent
    }

    Token public token; // Token contract reference
    address public multisigETH; // Multisig contract that will receive the ETH
    uint public ethReceived; // Number of ETH received
    uint public totalTokensSent; // Number of tokens sent to ETH contributors
    uint public startBlock; // Crowdsale start block
    uint public endBlock; // Crowdsale end block
    uint public maxCap; // Maximum number of token to sell
    uint public minCap; // Minimum number of ETH to raise
    uint public minContributionETH; // Minimum amount to invest
    bool public crowdsaleClosed; // Is crowdsale still on going
    uint public tokenPriceWei;
    uint public campaignDurationDays; // campaign duration in days
    uint firstPeriod;
    uint secondPeriod;
    uint thirdPeriod;
    uint firstBonus;
    uint secondBonus;
    uint thirdBonus;
    uint public multiplier;
    uint public status;

    // Looping through Backer
    mapping(address => Backer) public backers; //backer list
    address[] public backersIndex;   // to be able to iterate through backers when distributing the tokens

    // Whitelist
    mapping (address => bool) public whitelisted;
    event Whitelist(address indexed participant);


    // @notice to verify if action is not performed out of the campaign range
    modifier respectTimeFrame() {
        if ((block.number < startBlock) || (block.number > endBlock))
            revert();
        _;
    }

    modifier minCapNotReached() {
        if (totalTokensSent >= minCap)
            revert();
        _;
    }

    // @notice to protect short address attack
    modifier onlyPayloadSize(uint numWords){
        assert(msg.data.length >= numWords * 32 + 4);
        _;
    }

    // Events
    event ReceivedETH(address backer, uint amount, uint tokenAmount);
    event Started(uint startBlockLog, uint endBlockLog);
    event Finalized(bool success);
    event ContractUpdated(bool done);

    // Crowd-sale  {constructor}
    // @notice fired when contract is created. Initializes all constant variables.

    function Crowdsale(uint _decimalPoints,
        address _multisigETH,
        uint _minContributionETH,
        uint _maxCap,
        uint _minCap,
        uint _tokenPriceWei,
        uint _campaignDurationDays) {

        multiplier = 10 ** _decimalPoints;
        multisigETH = _multisigETH;
        minContributionETH = _minContributionETH;
        startBlock = 0;
        endBlock = 0;
        maxCap = _maxCap * multiplier;
        tokenPriceWei = _tokenPriceWei;
        minCap = _minCap * multiplier;
        campaignDurationDays = _campaignDurationDays;
        totalTokensSent = 0;
        //TODO fill these following values as correct one when deploy contract
        firstPeriod = _firstPeriod;
        secondPeriod = _secondPeriod;
        thirdPeriod = _thirdPeriod;
        firstBonus = _firstBonus;
        secondBonus = _secondBonus;
        thirdBonus = _thirdBonus;
    }

    // @notice Specify address of token contract
    // @param _tokenAddress {address} address of token contract
    // @return res {bool}
    function updateTokenAddress(Token _tokenAddress) external onlyOwner() returns (bool res) {
        token = _tokenAddress;
        ContractUpdated(true);
        return true;
    }

    // {fallback function}
    // @notice It will call internal function which handles allocation of Ether and calculates tokens.
    function() payable onlyPayloadSize {
        contribute(msg.sender);
    }

    // @notice It will be called by owner to start the sale
    function start() onlyOwner() {
        startBlock = block.number;
        endBlock = startBlock + (4 * 60 * 24 * campaignDurationDays);
        // assumption is that one block takes 15 sec.
        crowdsaleClosed = false;
        Started(startBlock, endBlock);
    }

    // @notice It will be called by fallback function whenever ether is sent to it
    // @param  _backer {address} address of beneficiary
    // @return res {bool} true if transaction was successful
    function contribute(address _backer) internal stopInEmergency respectTimeFrame returns (bool res) {
        // stop when required minimum is not sent
        if (msg.value < minContributionETH)
            revert();

        // calculate number of tokens
        uint tokensToSend = calculateNoOfTokensToSend();

        // Ensure that max cap hasn't been reached
        if (safeAdd(totalTokensSent, tokensToSend) > maxCap)
            revert();

        Backer storage backer = backers[_backer];

        if (backer.weiReceived == 0)
            backersIndex.push(_backer);

        // Transfer tokens to contributor
        if (!token.transfer(_backer, tokensToSend))
            revert();

        backer.tokensSent = safeAdd(backer.tokensSent, tokensToSend);
        backer.weiReceived = safeAdd(backer.weiReceived, msg.value);
        ethReceived = safeAdd(ethReceived, msg.value);
        // Update the total Ether received
        totalTokensSent = safeAdd(totalTokensSent, tokensToSend);

        ReceivedETH(_backer, msg.value, tokensToSend);
        return true;
    }

    // @notice This function will return number of tokens based on time intervals in the campaign
    function calculateNoOfTokensToSend() constant internal returns (uint) {
        uint tokenAmount = safeDiv(safeMul(msg.value, multiplier), tokenPriceWei);
        // TODO Add more bonus stage when deploy contract
        if (block.number <= startBlock + firstPeriod)
            return tokenAmount + safeDiv(safeMul(tokenAmount, firstBonus), 100);
        else if (block.number <= startBlock + secondPeriod)
            return tokenAmount + safeDiv(safeMul(tokenAmount, secondBonus), 100);
        else if (block.number <= startBlock + thirdPeriod)
            return tokenAmount + safeDiv(safeMul(tokenAmount, thirdBonus), 100);
        else
            return tokenAmount;
    }

    function WhitelistParticipant(address participant) external onlyAuthorized{
        whitelist[participant] = true;
        Whitelist(participant);
    }

    function BlacklistParticipant(address participant) external onlyAuthorized{
        whitelist[participant] = false;
        Whitelist(participant);
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
        address _crowdSaleAddress) {
        locked = true;
        // Lock the transfer of tokens during the crowdsale
        totalSupply = _initialSupply * (10 ** _decimalUnits);

        name = _tokenName;
        symbol = _tokenSymbol;
        decimals = _decimalUnits;
        crowdSaleAddress = _crowdSaleAddress;
        balances[crowdSaleAddress] = 700000000;
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
