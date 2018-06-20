const Agreement = artifacts.require('credit-coin-contracts/contracts/Agreement.sol');
const Token = artifacts.require('CCOIN.sol');
const moment = require('moment');

contract('AgreementTest', (accounts) => {
    let agreement,
        brand,
        creator,
        expiration,
        token;
    //create new smart contract instances before each test method
    
    before(async () => {
        brand = accounts[0];
        creator = accounts[1]
        expiration = moment().add(30, 'days').unix().valueOf();
        token = await Token.new({from: brand});
        agreement = await Agreement.new(creator, expiration, token.address, {from: brand});
    });

    it('should claim escrow reward', async () => {
        const name = "content",
            description = "Nice content",
            reward = 1000;

        await token.transfer(agreement.address, reward, {from: brand});
        await agreement.addContent(name, description, reward, {from: brand});
        const id = web3.sha3(name);
        await agreement.fulfillDeliverable(id, {from: creator});
        await agreement.approveDeliverable(id, {from: brand});

        const prevBalanceCreator = await token.balanceOf(creator);
        const prevBalanceAgreement = await token.balanceOf(agreement.address);
        
        await token.withdrawFromEscrow(agreement.address, id, {from: creator});
        const balanceCreator = await token.balanceOf(creator);
        const balanceAgreement = await token.balanceOf(agreement.address);

        console.log(prevBalanceCreator)
        console.log(balanceCreator)
    })

});
