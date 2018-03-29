./contracts folder contains all the contracts that are related to token generation.
./tests folder contains the same contracts plus some others for reference, and tests.
./contracts/standalone folder contains following 6 contracts as a single, standalone files for easier compilation.

EToken2.sol ByteCode identical with deployed 0x331d077518216c07C87f4f18bA64cd384c411F84 contract, compiler 0.4.8+commit.60cc1668, enabled optimization, 200 runs;
Ambi2.sol ByteCode identical with deployed 0x48681684FfcC808C10E519364d31B73662B3e333 contract, compiler 0.4.8+commit.60cc1668, enabled optimization, 200 runs;
EToken2Emitter.sol ByteCode identical with deployed 0xE8C051e1647A19Fbb0F94e3Cd3FcE074AE3C333D contract, compiler 0.4.8+commit.60cc1668, enabled optimization, 200 runs;
EventsHistory.sol ByteCode identical with deployed 0x60bf91ac87fEE5A78c28F7b67701FBCFA79C18EC contract, 0.3.5-nightly.2016.7.1+commit.48238c9, enabled optimization, 200 runs;
RegistryICAP.sol ByteCode identical with deployed 0x96a51938CFB22565E0d40694Fe103675c63AE218 contract, 0.3.5-nightly.2016.7.1+commit.48238c9, enabled optimization, 200 runs;
MultiAssetEmitter.sol ByteCode identical with deployed 0x4E8703a59FEc01A97d4d2D76271E4F086dbB52Fc contract, 0.3.5-nightly.2016.7.1+commit.48238c9, enabled optimization, 200 runs;

EToken2 is the main asset platform.
    It talks to EventsHistory to store events, which in turn asks MultiAssetEmitter and EToken2Emitter for event definitions.
        EventsHistory uses Ambi for admin access checks, admin is Ambisafe.
    It talks to RegistryICAP to resolve ICAP addresses.
        RegistryICAP uses Ambi for admin access checks, admin is Ambisafe.
    It uses Ambi2 for admin access checks, admin is Ambisafe.
    It talks to AssetProxy (deployed separately for every asset) which in turn talks to Asset (deployed separately).

AssetProxy is the ERC20 to EToken2 interface contract, entry point for asset users.

Ambi implementation is not revealed because it doesn't affect particular Asset lifecycle after asset being issued.

===================== Flatlay =====================

AssetProxy.sol renamed to CREDITCOIN and deployed at 0x5E51F6841D2F188c42c7C33A6A5E77FB05cFbAbE verified on etherscan.io;
AssetWithWhitelist.sol deployed at 0x1C2f4A056De78539A3c74d4A9D80306DeFb27361 0.4.15, enabled optimization, 10000 runs;

Calls flow: Caller ->
            CREDITCOIN.func(...) ->
            AssetWithWhitelist._performFunc(..., Caller.address) ->
            CREDITCOIN._forwardFunc(..., Caller.address) ->
            EToken2.proxyFunc(..., symbol, Caller.address)
