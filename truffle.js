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
        },
        development: {
            host: "localhost",
            port: 9545,
            network_id: "*",
            gas: 6712390
        } 
    }
};

// http://localhost:9545
// 0x89e78d5f62c66321c231854a1981510a5fe02758
// 196749ed808372060eaeffe10e56de82a48829fcf52199847e1e1db4b780ced0
// 0x99feebb064fd24fa4e274322144a3771fa423196