const Dai = artifacts.require('mocks/MyDai.sol');
const Bat = artifacts.require('mocks/MyBat.sol');
const Usdc = artifacts.require('mocks/MyUsdc.sol');
const Smt = artifacts.require('mocks/MySmt.sol');
const Dex = artifacts.require('MyDex.sol');

  // define the ticker - map to ascii version
  const [DAI, BAT, USDC, SMT] = ['DAI','BAT', 'USDC', 'SMT'].map(ticker => web3.utils.fromAscii(ticker));
  
  // define the ticker as 
  module.exports = async function(deploye, _network, acccounts) {
    const [trader1, trader2, trader3, trader4, _] = accounts;
    
    // gather token contracts to be dployed
    await Promise.all([ Dai, Bat, Usdc, Smt, Dex].map(contract => contract.deployed())
    );
    
    // store as constants 
    const [dai, bat, usdc, smt, dex] = await Promise.all([
        [Dai, Bat, Usdc, Smt, Dex].map(contract => contract.deployed())
        ]
    );  
    // add Tokens
    await Promise.all([
        dex.addToken(DAI, dai.address),
        dex.addToken(BAT, bat.address),
        dex.addToken(USDC, usdc.address),
        dex.addToken(SMT, smt.address),
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

    // allocate tokens and amount for all currencies to Trader1
    await Promise.all(
        [dai, bat, usdc, smt].map(token => seedTokenBalance(token, trader1)
    ));
    
    // allocate tokens and amount for all currencies to Trader2
    await Promise.all(
        [dai, bat, usdc, smt].map(token => seedTokenBalance(token, trader2)
    ));

    // allocate tokens and amount for all currencies to Trader3
    await Promise.all(
        [dai, bat, usdc, smt].map(token => seedTokenBalance(token, trader3)
    ));
    
    // allocate tokens and amount for all currencies to Trader4
    await Promise.all(
        [dai, bat, usdc, smt].map(token => seedTokenBalance(token, trader4)
    ));      
    

};