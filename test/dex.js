const { expectRevert } = require('@openzeppelin/test-helpers');
const Dai = artifacts.require('mocks/MyDai.sol');
const Bat = artifacts.require('mocks/MyBat.sol');
const Usdc = artifacts.require('mocks/MyUsdc.sol');
const Smt = artifacts.require('mocks/MySmt.sol');
const Dex = artifacts.require('MyDex.sol');


// define Tx Sides
const SIDE = {
    BUY: 0,
    SELL: 1
}


// define test block 
// will return an array of contracts
contract('Dex', (accounts) => {
    let dai, bat, usdc, smt, dex;
    // define participants
    const[trader1, trader2] = [accounts[1], accounts[2]];
    // define the ticker - map to ascii version
    const [DAI, BAT, USDC, SMT] = ['DAI','BAT', 'USDC', 'SMT'].map(ticker => web3.utils.fromAscii(ticker))
    // define the ticker as 
    beforeEach(async () => {
    // contracts destructured into the defined vars
       ([dai,bat,usdc,smt] = await Promise.all([
            Dai.new(),
            Bat.new(),
            Usdc.new(),
            Smt.new()
        ]));
        
        dex = await Dex.new();  
        
        // execute the adding of tokens .all - all tx's can happen at the same time
        await Promise.all([
            dex.addToken(DAI, dai.address),
            dex.addToken(BAT, bat.address),
            dex.addToken(USDC, usdc.address),
            dex.addToken(SMT, smt.address)
        ]);

        // define amount of token allocation '1000' wei
        const amount = web3.utils.toWei('1000');
        // seed the tokens, providing amount and whom the go to
        const seedTokenBalance = async (token, trader) => {
            await token.faucet(trader, amount);
            await token.approve(
                dex.address,
                amount,
                {from: trader}
            );
        };
        
        // allocate token and amount for all currencies to Trader1
        await seedTokenBalance(dai, trader1);
        await seedTokenBalance(bat, trader1);
        await seedTokenBalance(usdc, trader1);
        await seedTokenBalance(smt, trader1);

        // allocate token and amount for all currencies to Trader1
        await seedTokenBalance(dai, trader2);
        await seedTokenBalance(bat, trader2);
        await seedTokenBalance(usdc, trader2);
        await seedTokenBalance(smt, trader2);
    });

    // test depsoit function user can deposite a token on a dex 
    it('should deposit tokens', async () => {
        const amount = web3.utils.toWei('100');

        await dex.deposit(
            amount, 
            DAI, 
            {from: trader1}
        );
        // store the balance
        const balance = await dex.traderBalances(trader1, DAI);
        // assert that its true
    assert(balance.toString() === amount);// conv BN 
    });

     //tokens not registered
    it('should NOT deposit tokens if token does not exist', async() => {
        await expectRevert (
            dex.deposit(
                web3.utils.toWei('100'),
                web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
            {from: trader1}), 'this token does not exist')
    });
// test can tokens be withdrawn then checks if the tx was successful
            it('should withdraw tokens', async() => {
                const amount = web3.utils.toWei('100');
                // deposit 100
                await dex.deposit(
                    amount, 
                    DAI, 
                    {from: trader1}
                );
                // withdraw 100
                await dex.withdraw(
                    amount,
                    DAI,
                    {from: trader1} 
                );

                const balanceDex = await dex.traderBalances(trader1, DAI);
                const balanceDai = await dai.balanceOf(trader1)  
                
                assert(balanceDex.isZero());
                assert(balanceDai.toString() === web3.utils.toWei('1000'))
            });

    // test token widraw witih invalid ticker and amount 
    it('Should NOT withraw tokens if token does not exist', async () => {
        await expectRevert(
            dex.withdraw(
                web3.utils.toWei('100'),
                web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
                {from: trader1}
                ), 
            'this token does not exist'
        );
    });


    it('Should NOT withdraw tokens if balance is too low', async() => {
        // deposit 100 
        await dex.deposit(
            web3.utils.toWei('100'),
            DAI,
            {from: trader1}
        );
        // try to withdraw 1000                
        await expectRevert(
            dex.withdraw(
                web3.utils.toWei('1000'),
                DAI,
                {from: trader1}
                ),
                'balance too low'
            );
    });

// Limit Order Happy Path 
it('should create limit order', async() => {
         
    // Trader1 creates makes a deposit
    await dex.deposit(
        web3.utils.toWei('100'),
        DAI,
        {from: trader1}
    );
    
    // Trader1 creates Limit Order 
    await dex.createLimitOrder(
        web3.utils.toWei('10'),//amount
        BAT, 
        10,//price
        SIDE.BUY,
        {from: trader1}
    );

    // get all of the buy orders
    let buyOrders = await dex.getOrders(BAT, SIDE.BUY);
    // get all of the sell orders
    let sellOrders = await dex.getOrders(BAT, SIDE.SELL);

    // assert limit order
    assert(buyOrders.length === 1); // one order made
    assert(buyOrders[0].trader === trader1); // one order made    
    assert(buyOrders[0].ticker === web3.utils.padRight(BAT, 64)); // padRight cuz ticker will come back padded from Scontract        
    assert(buyOrders[0].price === '10'); // should be 10
    assert(buyOrders[0].amount === web3.utils.toWei('10')); // should be 10   
    assert(sellOrders.length === 0); // no sell orders should be made

    // Trader2 created a deposit order        
    await dex.deposit(
        web3.utils.toWei('200'),
        DAI,
        {from: trader2}
    );
      
    // Trader2 creates Limit Order 
    await dex.createLimitOrder(
        web3.utils.toWei('10'),//amount
        BAT, 
        11,//price
        SIDE.BUY,
        {from: trader2}
    );

    // get all of the buy orders
    buyOrders = await dex.getOrders(BAT, SIDE.BUY);
    // get all of the sell orders
    sellOrders = await dex.getOrders(BAT, SIDE.SELL);
    // assert limit order
    assert(buyOrders.length === 2);
    assert(buyOrders[0].trader === trader2);
    assert(buyOrders[1].trader === trader1);
    assert(sellOrders.length === 0); // no sell orders should be made


    // Trader2 deposits for a 3rd Limit order
    await dex.deposit(
        web3.utils.toWei('200'),
        DAI,
        {from: trader2}
    );
      
    // Trader2 creates Limit Order 
    await dex.createLimitOrder(
        web3.utils.toWei('10'),//amount
        BAT, 
        9,//price
        SIDE.BUY,
        {from: trader2}
    );
       buyOrders = await dex.getOrders(BAT, SIDE.BUY);
       sellOrders = await dex.getOrders(BAT, SIDE.SELL);
       // assert limit order
       assert(buyOrders.length === 3);
       assert(buyOrders[0].trader === trader2);
       assert(buyOrders[1].trader === trader1);
       assert(buyOrders[2].trader === trader2);
       assert(sellOrders.length === 0); 
    });


    it('Should NOT create a limit order if the token balance is too low', async() => {
        await dex.deposit(
            web3.utils.toWei('99'),
            BAT,
            {from: trader1}
        );
        
        await expectRevert(
            dex.createLimitOrder(
                web3.utils.toWei('100'),
                BAT,
                10,
                SIDE.SELL,
                {from: trader1}
            ), 'token balance too low'
      )});

      it('Should NOT create a limit order if the DAI balance is too low', async() => {
        await dex.deposit(
            web3.utils.toWei('99'),
            DAI,
            {from: trader1}
        );

        await expectRevert(
            dex.createLimitOrder(
                web3.utils.toWei('10'),
                BAT,
                10,
                SIDE.BUY,
                {from: trader1}
            ), 'DAI balance too low'
        );    
    });


    it('Should NOT create a limit order if the token is DAI', async() => {
        await expectRevert(
            dex.createLimitOrder(
                web3.utils.toWei('100'),
                DAI,
                10,
                SIDE.BUY,
                {from: trader1}
            ), 
        'cannot trade DAI')
    });


    it ('Should NOT create limit order if token does not exist', async() => {
        await expectRevert(
            dex.createLimitOrder(
                web3.utils.toWei('100'),
                web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
                10,
                SIDE.SELL,
                {from: trader1}
                ), 
            'this token does not exist'
        );
    });

    // Market Order Happy Path 

    it('should create market order & match', async () => {
        
        await dex.deposit(
          web3.utils.toWei('100'),
          DAI,
          {from: trader1}
        );
      
        await dex.createLimitOrder(
          web3.utils.toWei('10'),
          BAT,
          10,
          SIDE.BUY,
          {from: trader1}
        );
      
        await dex.deposit(
          web3.utils.toWei('100'),
          BAT,
          {from: trader2}
        );
      
        await dex.createMarketOrder(
            web3.utils.toWei('5'),
            BAT,
            SIDE.SELL,
          {from: trader2}
        );

        const orders = await dex.getOrders(BAT, SIDE.BUY);
        assert(orders.length === 1);
        assert(orders[0].filled = web3.utils.toWei('5'));

        const balances = await Promise.all([
            dex.traderBalances(trader1, DAI),
            dex.traderBalances(trader1, BAT),
            dex.traderBalances(trader2, DAI),
            dex.traderBalances(trader2, BAT),
          ]);
        
        assert(balances[0].toString() === web3.utils.toWei('50'));
        assert(balances[1].toString() === web3.utils.toWei('5'));
        assert(balances[2].toString() === web3.utils.toWei('50'));
        assert(balances[3].toString() === web3.utils.toWei('95'));
      });

      // UP: Should not create a market order if the token balance is too low

      it('Should NOT create market order if token balance is too low', async () => {
          await expectRevert(
              dex.createMarketOrder(
                web3.utils.toWei('101'),
                BAT,
                SIDE.SELL,
                {from: trader2}
              ),'token balance too low'
            );
        });

      // UP: Should not creaste a market order if the order is for DAI

      it('Should NOT create a market order if DAI balance is too low', async () => {
       
        await dex.deposit(
            web3.utils.toWei('100'),
            BAT,
            {from: trader1}
        );
       
       
        await dex.createLimitOrder(
            web3.utils.toWei('100'),//amount
            BAT, 
            9,//price
            SIDE.SELL,
            {from: trader1}
        );
       
        await expectRevert(
            dex.createMarketOrder(
              web3.utils.toWei('100'),
              BAT,
              SIDE.BUY,
              {from: trader2}
            ),'DAI balance too low'
          );
      });


      it ('Should NOT create Market Order if token does not exist', async() => {
        await expectRevert(
            dex.createMarketOrder(
                web3.utils.toWei('100'),
                web3.utils.fromAscii('TOKEN-DOES-NOT-EXIST'),
                SIDE.BUY,
                {from: trader1}
                ), 
            'this token does not exist'
        );
    });


    it('Should NOT create a market order if the token is DAI', async() => {
        await expectRevert(
            dex.createMarketOrder(
                web3.utils.toWei('100'),
                DAI,
                SIDE.BUY,
                {from: trader1}
            ), 
        'cannot trade DAI')
    });

});
   

    


