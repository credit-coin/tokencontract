const CCOIN = artifacts.require("CCOIN.sol");
module.exports = async function(callback) {
    try {
        const token = await CCOIN.new();
        console.log(token.address);
    } catch (error) {
        console.log(error)
    }
};
