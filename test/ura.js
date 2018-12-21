const URAToken = artifacts.require('URAToken');
const provider = 'http://localhost:8545';
const utils = web3._extend.utils;

web3.setProvider(new web3.providers.HttpProvider(provider));
URAToken.setProvider(provider);


let URATokenContract = new Promise((resolve, reject) => {
  let contract = web3.eth.contract(URAToken.abi);

  contract.new(
    {
      from: web3.eth.accounts[0],
      data: URAToken.bytecode,
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
let getBlockNumber = () => {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((err, number) => {
      if (err) return reject(err);
      return resolve(number);
    });
  });
};


contract('URATokenTest', (accounts) => {
  let instance;
  let advertisingCosts;
  let forReferralCosts;
  let dividendsCosts;
  let forWithdrawCosts;

  it('Testing fallback function and accrual of tokens!', async () => {
    instance = await URATokenContract;

    advertisingCosts = await instance.advertisingCosts.call();
    forReferralCosts = await instance.forReferralCosts.call();
    dividendsCosts = await instance.dividendsCosts.call();
    forWithdrawCosts = await instance.forWithdrawCosts.call();

    let startedPrice = await instance.tokenPrice.call();
    let totalSupply0 = await instance.totalSupply.call();
    let dividendes0 = await instance.dividendes();
    let nonce = await web3.eth.getTransactionCount(web3.eth.accounts[0]);
    let amount = utils.toWei('1', 'ether');

    await web3.eth.sendTransaction({
      nonce: nonce,
      from: web3.eth.accounts[0],
      to: instance.address,
      value: amount,
      gas: 4700000
    });

    let lastPrice = await instance.tokenPrice.call();
    let tokenBalance = await instance.balanceOf.call(web3.eth.accounts[0]);
    let amountEther = utils.toBigNumber(amount);
    let forDividendes = amountEther.mul(dividendsCosts).div(100);
    let incomingEthereum = amountEther.sub(
      amountEther.mul(advertisingCosts.add(dividendsCosts)).div(100)
    );

    let tokensReceived = incomingEthereum.div(startedPrice);
    let reverseAccess = incomingEthereum.sub(tokensReceived.mul(startedPrice));
    let totalSupply1 = await instance.totalSupply.call();
    let dividendes1 = await instance.dividendes();

    assert.ok(startedPrice < lastPrice,
             'the price for the token does not grow with the purchase!'+
             `startedPrice: ${startedPrice}, lastPrice: ${lastPrice}`);
    assert.equal(tokensReceived.toString(), tokenBalance.toString(),
                'accrual does not match the formula!'+
                `tokensReceived: ${tokensReceived}, tokenBalance:${tokenBalance}`);
    assert.equal(totalSupply0.add(tokensReceived).toString(), totalSupply1.toString(),
                'wrong distribution of tokens in param totalSupply, '+
                `totalSupply0: ${totalSupply0.toString()}, totalSupply1: ${totalSupply1.toString()}`);
    assert.equal(dividendes0.add(forDividendes).toString(), dividendes1.toString(),
                'miscalculation of dividends, '+
                `dividendes0: ${dividendes0.toString()}, dividendes1: ${dividendes1.toString()}`);

    return instance;
  });

  it('Testing fallback for referral', async () => {
    let referral = web3.personal.newAccount('referral account');
    let nonce = await web3.eth.getTransactionCount(web3.eth.accounts[0]);
    let amount = utils.toWei('1', 'ether');
    let startReferralBalance = await web3.eth.getBalance(referral);

    await web3.eth.sendTransaction({
      nonce: nonce,
      from: web3.eth.accounts[0],
      to: instance.address,
      value: amount,
      gas: 4700000,
      data: referral
    });

    let lastReferralBalance = await web3.eth.getBalance(referral);
    let percentForReferral = utils.toBigNumber(amount).mul(forReferralCosts).div(100);

    assert.equal(percentForReferral.toString(), lastReferralBalance.toString(),
                'accrual does not match the formula!'+
                `balance0: ${startReferralBalance}, balance1: ${percentForReferral}`);
    assert.ok(startReferralBalance < lastReferralBalance, 'wrong balance');

    return instance;
  });

  it('Testing withdraw tokens function', async () => {
    let tokenPrice = await instance.tokenPrice.call();
    let totalSupply0 = await instance.totalSupply.call();
    let nonce = await web3.eth.getTransactionCount(web3.eth.accounts[0]);
    let balance0 = await web3.eth.getBalance(web3.eth.accounts[0]);
    let tokenBalance0 = await instance.balanceOf.call(web3.eth.accounts[0]);
    let withdrawData = await instance.withdraw.getData(tokenBalance0);
    let gas = await web3.eth.estimateGas({ to: instance.address, data: withdrawData });

    await web3.eth.sendTransaction({
      nonce: nonce,
      from: web3.eth.accounts[0],
      to: instance.address,
      gas: gas,
      data: withdrawData
    });

    let balance1 = await web3.eth.getBalance(web3.eth.accounts[0]);
    let calculation = tokenPrice.mul(tokenBalance0);
    let percentFordividends = calculation.mul(forWithdrawCosts).div(100);
    let totalSupply1 = await instance.totalSupply.call();

    calculation = calculation.sub(percentFordividends);

    assert.ok(balance1 > balance0, 'wrong charge ether, '+` calculation: ${calculation}`);
    assert.equal(totalSupply0.sub(tokenBalance0).toString(), totalSupply1.toString(),
                'wrong distribution of tokens in param totalSupply, '+
                `totalSupply0: ${totalSupply0.toString()}, totalSupply1: ${totalSupply1.toString()}`);
  });

  it('Testing accumulation dividendes function', async () => {
    let nonce = await web3.eth.getTransactionCount(web3.eth.accounts[0]);
    let amount = utils.toWei('1', 'ether');
    let numberOfblocks = 10 + nonce;
    let dividendesOwner0 = await instance.dividendesOf.call(web3.eth.accounts[0]);

    for (let index = nonce; index < numberOfblocks; index++) {
      await web3.eth.sendTransaction({
        nonce: nonce,
        from: web3.eth.accounts[0],
        to: instance.address,
        value: amount,
        gas: 4700000
      });
      nonce++;
    }

    let dividendesOwner1 = await instance.dividendesOf.call(web3.eth.accounts[0]);

    assert.ok(dividendesOwner1 > dividendesOwner0,
              'wrong dividend amount, '+`dividendesOwner: ${dividendesOwner1}`);
  });

});
