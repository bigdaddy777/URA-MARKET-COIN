const ToAddress = artifacts.require('TestAddress');
const provider = 'http://localhost:8545';
const utils = web3._extend.utils;

web3.setProvider(new web3.providers.HttpProvider(provider));
ToAddress.setProvider(provider);

let ToAddressContract = new Promise((resolve, reject) => {
  let contract = web3.eth.contract(ToAddress.abi);

  contract.new(
    {
      from: web3.eth.accounts[0],
      data: ToAddress.bytecode,
      gas: 4700000
    }, (e, contract) => {
     if (typeof contract.address !== 'undefined') {
        resolve(contract);
     }
     if (e) {
       reject(e);
     }
  });
});


contract('ToAddressContractTest', (accounts) => {
  let instance;
  let zeroAddress = '0x0000000000000000000000000000000000000000';

  it('Testing isNotContract function', async () => {
    instance = await ToAddressContract;

    let contracAddress = await instance.isNotContract.call(instance.address);
    let accountsAdress = await instance.isNotContract.call(web3.eth.accounts[0]);

    assert.ok(contracAddress == false, "isNotContract not isNotContract");
    assert.ok(accountsAdress == true, "isNotContract not accounts");
  });

  it('Testing empty to zero addr', async () => {
    let testAddress = await instance.bytesToAddr.call('');

    assert.equal(
      zeroAddress.toLowerCase(),
      testAddress.toLowerCase(),
      "the address must be empty"
    );
  });

  it('Testing bytes to address', async () => {
    for (let index = 0; index < 10; index++) {
      let account = web3.personal.newAccount('account' + index);
      let testAddress = await instance.bytesToAddr.call(account);

      assert.equal(account, testAddress, "account != testAddress");
      assert.ok(testAddress != zeroAddress, "account = zeroAddress");
    }
  });

});
