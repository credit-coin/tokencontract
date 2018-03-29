contract CosignerForTests {
    uint public signChecks;
    function isSigned(bytes32) returns(bool) {
        signChecks++;
        return true;
    }
}