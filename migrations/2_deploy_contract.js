const Dai = artifacts.require('mocks/MyDai.sol');
const Bat = artifacts.require('mocks/MyBat.sol');
const Ada = artifacts.require('mocks/MyAda.sol');
const Smt = artifacts.require('mocks/MySmt.sol');
const Dex = artifacts.require('Dex.sol'); 

  // define the ticker - map to ascii version
  const [DAI, BAT, ADA, SMT] = ['DAI','BAT', 'ADA', 'SMT']
  .map(ticker => web3.utils.fromAscii(ticker));
  
  const SIDE = {
    BUY: 0,
    SELL: 1
  };

  // define the ticker as 
module.exports = async function(deployer, _network, accounts) {
    const [trader1, trader2, trader3, trader4, _] = accounts;    
    // gather token contracts to be dployed
    await Promise.all(
        [ Dai, Bat, Ada, Smt, Dex].map(contract => deployer.deploy(contract))
    );
    
    // store as constants 
    const [dai, bat, ada, smt, dex] = await Promise.all(
        [Dai, Bat, Ada, Smt, Dex].map(contract => contract.deployed())
    );  
    
    await dex.addToken(DAI, dai.address);
    await dex.addToken(BAT, bat.address);
    await dex.addToken(ADA, ada.address);
    await dex.addToken(SMT, smt.address);
    
    // await Promise.all([
    //     await dex.addToken(DAI, dai.address),
    //     await dex.addToken(BAT, bat.address),
    //     await dex.addToken(ADA, ada.address),
    //     await dex.addToken(SMT, smt.address)
    // ]);    

    // define amount of token allocation '1000' wei
    const amount = web3.utils.toWei('1000');
    // seed the tokens, providing amount and whom the go to
    const seedTokenBalance = async (token, trader) => {
        await token.faucet(trader, amount); // dev mode only
        await token.approve(
            dex.address,
            amount,
            {from: trader}
        );
 
        // store names in a var
        const ticker = await token.name();    

        // call too deposit deposit
        await dex.deposit(
            amount,
            web3.utils.fromAscii(ticker),
            {from: trader}
        );    
    };
    
    // allocate tokens and amounts to Trader1

    await seedTokenBalance(dai, trader1);
    await seedTokenBalance(bat, trader1);
    await seedTokenBalance(ada, trader1);
    await seedTokenBalance(smt, trader1);
    
    // allocate tokens and amounts to Trader2

    await seedTokenBalance(dai, trader2);
    await seedTokenBalance(bat, trader2);
    await seedTokenBalance(ada, trader2);
    await seedTokenBalance(smt, trader2);

    // allocate tokens and amounts to Trader3

    await seedTokenBalance(dai, trader3);
    await seedTokenBalance(bat, trader3);
    await seedTokenBalance(ada, trader3);
    await seedTokenBalance(smt, trader3);

    // allocate tokens and amounts to Trader4

    await seedTokenBalance(dai, trader4);
    await seedTokenBalance(bat, trader4);
    await seedTokenBalance(ada, trader4);
    await seedTokenBalance(smt, trader4);

// increase time.
const increaseTime = async (seconds) => {
    await web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [seconds],
      id: 0,
    }, () => {});
    await web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_mine',
      params: [],
      id: 0,
    }, () => {});
  }

// create trades
await dex.createLimitOrder(1000, BAT, 10, SIDE.BUY, {from: trader1});
await dex.createMarketOrder(1000, BAT, SIDE.SELL, {from: trader2});
await increaseTime(1);

// await dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader1});
// await dex.createMarketOrder(BAT, 1200, SIDE.SELL, {from: trader2});
// await increaseTime(1);

// await dex.createLimitOrder(BAT, 1200, 15, SIDE.BUY, {from: trader1});
// await dex.createMarketOrder(BAT, 1200, SIDE.SELL, {from: trader2});
// await increaseTime(1);

// await dex.createLimitOrder(BAT, 1500, 14, SIDE.BUY, {from: trader1});
// await dex.createMarketOrder(BAT, 1500, SIDE.SELL, {from: trader2});
// await increaseTime(1);

// await dex.createLimitOrder(BAT, 2000, 12, SIDE.BUY, {from: trader1});
// await dex.createMarketOrder(BAT, 2000, SIDE.SELL, {from: trader2});

// await dex.createLimitOrder(ADA, 1000, 2, SIDE.BUY, {from: trader1});
// await dex.createMarketOrder(ADA, 1000, SIDE.SELL, {from: trader2});
// await increaseTime(1);

// await dex.createLimitOrder(ADA, 500, 4, SIDE.BUY, {from: trader1});
// await dex.createMarketOrder(ADA, 500, SIDE.SELL, {from: trader2});
// await increaseTime(1);

// await dex.createLimitOrder(ADA, 800, 2, SIDE.BUY, {from: trader1});
// await dex.createMarketOrder(ADA, 800, SIDE.SELL, {from: trader2});
// await increaseTime(1);

// await dex.createLimitOrder(ADA, 1200, 6, SIDE.BUY, {from: trader1});
// await dex.createMarketOrder(ADA, 1200, SIDE.SELL, {from: trader2});


// await dex.createLimitOrder(BAT, 1400, 10, SIDE.BUY, {from: trader1});
// await dex.createLimitOrder(BAT, 1200, 11, SIDE.BUY, {from: trader2});
// await dex.createLimitOrder(BAT, 1000, 12, SIDE.BUY, {from: trader2});

// await dex.createLimitOrder(ADA, 3000, 4, SIDE.BUY, {from: trader1});
// await dex.createLimitOrder(ADA, 2000, 5, SIDE.BUY, {from: trader1});
// await dex.createLimitOrder(ADA, 500, 6, SIDE.BUY, {from: trader2});

// await dex.createLimitOrder(SMT, 4000, 12, SIDE.BUY, {from: trader1});
// await dex.createLimitOrder(SMT, 3000, 13, SIDE.BUY, {from: trader1});
// await dex.createLimitOrder(SMT, 500, 14, SIDE.BUY, {from: trader2});

// await dex.createLimitOrder(BAT, 2000, 16, SIDE.SELL, {from: trader3});
// await dex.createLimitOrder(BAT, 3000, 15, SIDE.SELL, {from: trader4});
// await dex.createLimitOrder(BAT, 500, 14, SIDE.SELL, {from: trader4});

// await dex.createLimitOrder(ADA, 4000, 10, SIDE.SELL, {from: trader3});
// await dex.createLimitOrder(ADA, 2000, 9, SIDE.SELL, {from: trader3});
// await dex.createLimitOrder(ADA, 800, 8, SIDE.SELL, {from: trader4});

// await dex.createLimitOrder(SMT, 1500, 23, SIDE.SELL, {from: trader3});
// await dex.createLimitOrder(SMT, 1200, 22, SIDE.SELL, {from: trader3});
// await dex.createLimitOrder(SMT, 900, 21, SIDE.SELL, {from: trader4});

};