pragma solidity ^0.4.22;


/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
contract SafeMath {
    function safeMul(uint a, uint b) pure internal returns (uint) {
        if (a == 0) {
            return 0;
        }
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function safeDiv(uint a, uint b) pure internal returns (uint) {
        return a / b;
    }

    function safeSub(uint a, uint b) pure internal returns (uint) {
        assert(b <= a);
        return a - b;
    }

    function safeAdd(uint a, uint b) pure internal returns (uint) {
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


// Token Contract
contract CCOIN is ERC20, SafeMath, Ownable {
    // Public variables of the token
    string public constant name = "CCOIN";
    string public constant symbol = "CCOIN";
    uint public constant decimals = 18;
    uint public totalSupply = 1000000000 * 10 ** 18;
    bool public locked;

    address public multisigETH; // Multisig contract that will receive the ETH
    address public crowdSaleAddress; // Crowdsale address
    uint public ethReceived; // Number of ETH received
    uint public totalTokensSent; // Number of tokens sent to ETH contributors
    uint public startBlock; // Crowdsale start block
    uint public endBlock; // Crowdsale end block
    uint public maxCap; // Maximum number of token to sell
    uint public minCap; // Minimum number of ETH to raise
    uint public minContributionETH; // Minimum amount to invest
    uint public tokenPriceWei;

    uint firstPeriod;
    uint secondPeriod;
    uint thirdPeriod;
    uint fourthPeriod;
    uint fifthPeriod;
    uint firstBonus;
    uint secondBonus;
    uint thirdBonus;
    uint fourthBonus;
    uint fifthBonus;
    uint public multiplier;

    bool public stopInEmergency = false;

    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowed;

    // Whitelist
    mapping(address => bool) public whitelisted;

    event Whitelist(address indexed participant);
    event Locked();
    event Unlocked();
    event StoppedCrowdsale();
    event RestartedCrowdsale();

    // Lock transfer during the ICO
    modifier onlyUnlocked() {
        if (msg.sender != crowdSaleAddress && locked && msg.sender != owner)
            revert();
        _;
    }

    // @notice to protect short address attack
    modifier onlyPayloadSize(uint numWords){
        assert(msg.data.length >= numWords * 32 + 4);
        _;
    }

    modifier onlyAuthorized() {
        if (msg.sender != crowdSaleAddress && msg.sender != owner)
            revert();
        _;
    }

    // The Token constructor
    constructor() public {
        locked = true;
        multiplier = 10 ** 18;
        //balances[crowdSaleAddress] = 700000000 * multiplier;


        multisigETH = 0x701e600d07C2bD97f11F92F23d7ae8460f5181f4;
        minContributionETH = 1;
        startBlock = 0;
        endBlock = 0;
        maxCap = 1000 * multiplier;
        tokenPriceWei = safeDiv(1, 1400);
        minCap = 100 * multiplier;
        totalTokensSent = 0;
        firstPeriod = 100;
        secondPeriod = 200;
        thirdPeriod = 300;
        fourthPeriod = 400;
        fifthPeriod = 500;

        firstBonus = 120;
        secondBonus = 115;
        thirdBonus = 110;
        fourthBonus = safeDiv(1075, 10);
        fifthBonus = 105;
    }

    function resetCrowdSaleAddress(address _newCrowdSaleAddress) public onlyAuthorized() {
        crowdSaleAddress = _newCrowdSaleAddress;
    }

    function unlock() public onlyAuthorized {
        locked = false;
        emit Unlocked();
    }

    function lock() public onlyAuthorized {
        locked = true;
        emit Locked();
    }

    function burn(address _member, uint256 _value) public onlyAuthorized returns (bool) {
        balances[_member] = safeSub(balances[_member], _value);
        totalSupply = safeSub(totalSupply, _value);
        emit Transfer(_member, 0x0, _value);
        return true;
    }

    function transfer(address _to, uint _value) public onlyUnlocked returns (bool) {
        balances[msg.sender] = safeSub(balances[msg.sender], _value);
        balances[_to] = safeAdd(balances[_to], _value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /* A contract attempts to get the coins */
    function transferFrom(address _from, address _to, uint256 _value) public onlyUnlocked returns (bool success) {
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
        emit Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address _owner) public constant returns (uint balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }

    function WhitelistParticipant(address participant) external onlyAuthorized {
        whitelisted[participant] = true;
        emit Whitelist(participant);
    }

    function BlacklistParticipant(address participant) external onlyAuthorized {
        whitelisted[participant] = false;
        emit Whitelist(participant);
    }

    // {fallback function}
    // @notice It will call internal function which handles allocation of Ether and calculates tokens.
    function() public payable onlyPayloadSize(2) {
        contribute(msg.sender);
    }

    // @notice It will be called by fallback function whenever ether is sent to it
    // @param  _backer {address} address of beneficiary
    // @return res {bool} true if transaction was successful
    function contribute(address _backer) internal returns (bool res) {
        // stop when required minimum is not sent
        if (msg.value < minContributionETH)
            revert();

        // calculate number of tokens
        uint tokensToSend = calculateNoOfTokensToSend();

        // Ensure that max cap hasn't been reached
        if (safeAdd(totalTokensSent, tokensToSend) > maxCap)
            revert();

        // Transfer tokens to contributor
        if (!transfer(_backer, tokensToSend))
            revert();

        ethReceived = safeAdd(ethReceived, msg.value);
        totalTokensSent = safeAdd(totalTokensSent, tokensToSend);

        return true;
    }

    // @notice This function will return number of tokens based on time intervals in the campaign
    function calculateNoOfTokensToSend() constant internal returns (uint) {
        uint tokenAmount = safeDiv(safeMul(msg.value, multiplier), tokenPriceWei);
        if (block.number <= startBlock + firstPeriod)
            return tokenAmount + safeDiv(safeMul(tokenAmount, firstBonus), 100);
        else if (block.number <= startBlock + secondPeriod)
            return tokenAmount + safeDiv(safeMul(tokenAmount, secondBonus), 100);
        else if (block.number <= startBlock + thirdPeriod)
            return tokenAmount + safeDiv(safeMul(tokenAmount, thirdBonus), 100);
        else if (block.number <= startBlock + fourthPeriod)
            return tokenAmount + safeDiv(safeMul(tokenAmount, fourthBonus), 100);
        else if (block.number <= startBlock + fifthPeriod)
            return tokenAmount + safeDiv(safeMul(tokenAmount, fifthBonus), 100);
        else
            return tokenAmount;
    }

    function stopCrowdsale() external onlyOwner{
        stopInEmergency = true;
        emit StoppedCrowdsale();
    }

    function restartCrowdsale() external onlyOwner{
        stopInEmergency = false;
        emit RestartedCrowdsale();
    }

}
