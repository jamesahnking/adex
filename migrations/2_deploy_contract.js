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
    
    // await dex.addToken(DAI, dai.address);
    // await dex.addToken(BAT, bat.address);
    // await dex.addToken(ADA, ada.address);
    // await dex.addToken(SMT, smt.address);
    
    await Promise.all([
        await dex.addToken(DAI, dai.address),
        await dex.addToken(BAT, bat.address),
        await dex.addToken(ADA, ada.address),
        await dex.addToken(SMT, smt.address)
    ]);    

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

// Trades 
await dex.createLimitOrder(1000, BAT, 10, SIDE.BUY, {from: trader1});
await dex.createMarketOrder(1000, BAT, SIDE.SELL, {from: trader2});
await increaseTime(1);

await dex.createLimitOrder(1200, BAT, 11, SIDE.BUY, {from: trader1});
await dex.createMarketOrder(1200,BAT, SIDE.SELL, {from: trader2});
await increaseTime(1);

await dex.createLimitOrder(1200, BAT, 15, SIDE.BUY, {from: trader1});
await dex.createMarketOrder(1200, BAT, SIDE.SELL, {from: trader2});
await increaseTime(1);

await dex.createLimitOrder(1500, BAT, 14, SIDE.BUY, {from: trader1});
await dex.createMarketOrder(1500, BAT,  SIDE.SELL, {from: trader2});
await increaseTime(1);

await dex.createLimitOrder( 2000, BAT,12, SIDE.BUY, {from: trader1});
await dex.createMarketOrder( 2000,BAT, SIDE.SELL, {from: trader2});
await increaseTime(1);

await dex.createLimitOrder(1000, ADA, 2, SIDE.BUY, {from: trader1});
await dex.createMarketOrder(1000, ADA, SIDE.SELL, {from: trader2});
await increaseTime(1);

await dex.createLimitOrder(500, ADA, 4, SIDE.BUY, {from: trader1});
await dex.createMarketOrder(500, ADA,  SIDE.SELL, {from: trader2});
await increaseTime(1);

await dex.createLimitOrder( 800, ADA, 2, SIDE.BUY, {from: trader1});
await dex.createMarketOrder( 800, ADA, SIDE.SELL, {from: trader2});
await increaseTime(1);

await dex.createLimitOrder( 1200, ADA, 6, SIDE.BUY, {from: trader1});
await dex.createMarketOrder(1200, ADA, SIDE.SELL, {from: trader2});

// Orders

await dex.createLimitOrder(1400, BAT, 10, SIDE.BUY, {from: trader1});
await dex.createLimitOrder(1200, BAT, 11, SIDE.BUY, {from: trader2});
await dex.createLimitOrder(1000, BAT, 12, SIDE.BUY, {from: trader2});

await dex.createLimitOrder(3000, ADA, 4, SIDE.BUY, {from: trader1});
await dex.createLimitOrder(2000, ADA, 5, SIDE.BUY, {from: trader1});
await dex.createLimitOrder(500, ADA, 6, SIDE.BUY, {from: trader2});

await dex.createLimitOrder(4000, SMT, 12, SIDE.BUY, {from: trader1});
await dex.createLimitOrder(3000, SMT, 13, SIDE.BUY, {from: trader1});
await dex.createLimitOrder(500, SMT, 14, SIDE.BUY, {from: trader2});

await dex.createLimitOrder(2000, BAT, 16, SIDE.SELL, {from: trader3});
await dex.createLimitOrder(3000, BAT, 15, SIDE.SELL, {from: trader4});
await dex.createLimitOrder(500, BAT, 14, SIDE.SELL, {from: trader4});

await dex.createLimitOrder(4000, ADA, 10, SIDE.SELL, {from: trader3});
await dex.createLimitOrder(2000,ADA,  9, SIDE.SELL, {from: trader3});
await dex.createLimitOrder(800, ADA, 8, SIDE.SELL, {from: trader4});

await dex.createLimitOrder(1500, SMT, 23, SIDE.SELL, {from: trader3});
await dex.createLimitOrder(1200, SMT,  22, SIDE.SELL, {from: trader3});
await dex.createLimitOrder(900, SMT, 21, SIDE.SELL, {from: trader4});

};