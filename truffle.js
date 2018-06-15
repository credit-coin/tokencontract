const HDWalletProvider = require("truffle-hdwallet-provider");
const testmnenomic = 'dignity pool release short project fancy museum frozen mobile lab uniform worry trick unlock nothing';
module.exports = {
    networks: {
        rinkeby: {
            host: "localhost",
            port: 8545,
            network_id: "4", // Rinkeby ID 4
            from: "0x7821586f1dd485a73e095E75ED42FcB4CcF6EDb7", // account from which to deploy
            gas: 6712390
        }  
    }
};

