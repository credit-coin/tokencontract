const Web3 = require("web3");
const web3 = new Web3();
const WalletProvider = require("truffle-wallet-provider");
const Wallet = require('ethereumjs-wallet');

var mainNetPrivateKey = new Buffer("96208C7AED7830B985AC8280A1B73CF7404EBBEFE1D1D894736D57F0370135A5", "hex")
var mainNetWallet = Wallet.fromPrivateKey(mainNetPrivateKey);
var mainNetProvider = new WalletProvider(mainNetWallet, "https://mainnet.infura.io/YZacpQ8C0BupYA52TSb0");
module.exports = {
    networks: {
        rinkeby: {
            host: "localhost",
            port: 8545,
            network_id: "4", // Rinkeby ID 4
            from: "0x44642a0f55833585ea369A986F999227d579FD03", // account from which to deploy
            gas: 6712390
        },
        development: {
            host: "localhost",
            port: 9545,
            network_id: "4000",
            gas: 6712390
        }, 
        mainnet: {
            provider: mainNetProvider,
            gasPrice: 2000000000,
            gas: 6100000,
            network_id: "1",
        }
    }
};

// http://localhost:9545
// 0x89e78d5f62c66321c231854a1981510a5fe02758
// 196749ed808372060eaeffe10e56de82a48829fcf52199847e1e1db4b780ced0
// 0x99feebb064fd24fa4e274322144a3771fa423196