# truffle-helpers

To add it to your truffle project, do `git submodule add git@github.com:Ambisafe/truffle-helpers.git` and commit

To clone a repo with submodules, do `git clone --recursive repoUrl`

To update existing repo after someone added a submodule there, do `git submodule init && git submodule update`

## EventsHelper

```
var eventsHelper = require('../truffle-helpers/eventsHelper.js');

it('should emit MyEvent event', function(done) {
  var contract = Contract.deployed();
  var watcher;
  eventsHelper.setupEvents(contract); // Call setupEvents directly before each emitting transaction.
  watcher = Contract.MyEvent();  // Create watcher directly before each emitting transaction.
  contract.myMethod().then(function(txHash) {
    return eventsHelper.getEvents(txHash, watcher); // Call getEvents directly after the emitting transaction.
  }).then(function(events) {
    assert.equal(events.length, 1);
    assert.equal(events[0].args.param, "Param");
  }).then(done).catch(done);
});
```
