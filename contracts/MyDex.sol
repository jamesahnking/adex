// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
/*
Ticker: DAI, ADA, - These are the symbols however 
storing strings in Solidity is expensive so we use. 
bytes32 now our ticker can be 32 charaters long.
.
*/

contract MyDex {


    /// @dev Limite Market sides
    enum Side {
        BUY,
        SELL
    }

    /// @dev Limit Market structure 
    struct Order {
        uint256 id; 
        address trader; 
        Side side; 
        bytes32 ticker;
        uint256 amount;
        uint256 filled;
        uint256 price;
        uint256 date;
    }

    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    mapping(bytes32 => Token) public tokens; // PAR => 0x123
    mapping(address => mapping(bytes32 => uint256)) public traderBalances; // Ox123 => PAR => $100
    // order book mapping 1 buy 0 sell - price time ordering best prices at the beginning[]
    mapping(bytes32 => mapping(uint256 => Order[])) public orderBook; 
    bytes32[] public tokenList; // array of tokens to iterate through
    address public admin; // admin address 
    uint256 public nextOrderId;// keep track of current order
    uint256 public nextTradeId; // keep track of market order trades
    bytes32 constant DAI = bytes32("DAI"); // DAI Constant
    
    /// @dev NEW TRADE Event
    event NewTrade(
        uint256 tradeId,
        uint256 orderId,
        bytes32 indexed ticker,
        address indexed trader1,
        address indexed trader2,
        uint256 amount, 
        uint256 price, 
        uint256 date
    );

    constructor() {
        admin = msg.sender; // creator of the smart contract
    }

    // returns list of orders 
    function getOrders(bytes32 ticker, Side side) external view returns(Order[] memory) {
        return orderBook[ticker][uint256(side)];
    }

    // returns list of tokens 
    function getTokens() external view returns(Token[] memory) {
      Token[] memory _tokens = new Token[](tokenList.length);
      for (uint i = 0; i < tokenList.length; i++) {
        _tokens[i] = Token(
          tokens[tokenList[i]].ticker,
          tokens[tokenList[i]].tokenAddress
        );
      }
      return _tokens;
    }

    /// @dev TOKEN REGISTERY 
    function addToken(bytes32 ticker, address tokenAddress) onlyAdmin() external {
        tokens[ticker] = Token(ticker, tokenAddress); // add token to mapping instantiationg the struct 
        tokenList.push(ticker); // add ticker to list 
    }

    /// @dev WALLET 
    function deposit(uint256 amount, bytes32 ticker) tokenExist(ticker) external {
        IERC20(tokens[ticker].tokenAddress).transferFrom( // interface
            msg.sender, // from 
            address(this), // to 
            amount  // how much 
        ); 
        
        // increment balance to the amount approved 
        traderBalances[msg.sender][ticker] += amount; 
    }

    function withdraw( uint256 amount, bytes32 ticker) tokenExist(ticker) external {
        require(traderBalances[msg.sender][ticker] >= amount, "balance too low"); // trader must have enough funds
        traderBalances[msg.sender][ticker] -= amount; // safemath

        IERC20(tokens[ticker].tokenAddress).transfer(  // interface
            msg.sender, // to trader
            amount  // how much 
        ); 
    }

    /// @dev LIMIT ORDERS 
    function createLimitOrder(uint256 amount, bytes32 ticker, uint256 price, Side side) tokenExist(ticker) daiNotAllowed(ticker) external {      
        if(side == Side.SELL) {
         require(traderBalances[msg.sender][ticker] >= amount,"token balance too low"
            ); // trader must have enough funds to sell
        } else {
            require(traderBalances[msg.sender][DAI] >= amount * price, "DAI balance too low"
            ); // trader must have enough funds to buy
        } 
        // instantiate order struct
        Order[] storage orders = orderBook[ticker][uint256(side)];
        // push order struct to storage
        orders.push(Order(
            nextOrderId,
            msg.sender, 
            side,
            ticker,
            amount,
            0, // orders start at 0
            price,
            block.timestamp
        ));

    // @dev - Bubble sort for price-time
    uint i = orders.length > 0 ? orders.length - 1 : 0;
    while(i > 0) {
        // if the order fits the price-time sequence then stop the loop the prices are in order
        if(side == Side.BUY && orders[i - 1].price > orders[i].price){
            break;
        }
        if(side == Side.SELL && orders[i - 1].price < orders[i].price){
            break; 
        }   // if the order isnt then swap till they are price-time aligned
            Order memory order = orders[i - 1]; // add previous order to temp memory 
            orders[i - 1] = orders[i]; // swap prev order with current
            orders[i] = order; // swap current with previous
            i--; //keep decrementing until we reach a break;
          }
        nextOrderId++; // increment id
    }

    /// @dev - CREATE MARKET ORDER 
    // if Im creating a market buy order I will need to get a list of sell orders
    // if Im creating a market sell order Il will need to get a list of all of the buy orders
    // Market orders can and will be matched against many different limit orders[market market order => limit sell 
    function createMarketOrder(uint256 amount, bytes32 ticker, Side side) tokenExist(ticker) daiNotAllowed(ticker) external {
        if(side == Side.SELL) {
            require(traderBalances[msg.sender][ticker] >= amount,
            "token balance too low");
            // instantiate the Order Book 
            /// @dev cast side as an integer 
            }
            Order[] storage orders = orderBook[ticker][uint256(side == Side.BUY ? Side.SELL : Side.BUY)];
            // iterate through the oderbook 
            uint256 i;
            // the reamining of the ordre that hasnt been filled 
            uint256 remaining = amount;
            // loop through the list of orderes
            while(i < orders.length && remaining > 0) {
                // whats left is the amount minus the amount of the order that has already been filled 
                uint256 available = orders[i].amount - orders[i].filled;
                uint256 matched = (remaining > available) ? available : remaining;
                remaining -= matched; 
                orders[i].filled += matched; 
                emit NewTrade(
                    nextTradeId,
                    orders[i].id,
                    ticker,
                    orders[i].trader, // the trader that created the other side of the transaction previously 
                    msg.sender,// trader that created the market order for this transaction
                    matched, 
                    orders[i].price, 
                    block.timestamp
                );
  
            /// @dev Update trader balances 
            // Sell asset for DAI and settle tx
            if(side == Side.SELL) {
                traderBalances[msg.sender][ticker]  -= matched; // sellers assets are subtracted - safemath
                traderBalances[msg.sender][DAI] += matched * orders[i].price; // seller paid in DAI - safemath
                traderBalances[orders[i].trader][ticker] += matched; // buyer recieves asset - safemath
                traderBalances[orders[i].trader][DAI] -= matched * orders[i].price; // price for asset subtracted from account - safemath
            }  
            // BUY asset for DAI
            if (side == Side.BUY) {
                require(
                    traderBalances[msg.sender][DAI] >= matched * orders[i].price, "DAI balance too low"
                );
            // Buy asset in DAI and settle tx
                traderBalances[msg.sender][ticker] += matched;
                traderBalances[msg.sender][DAI] -= matched * orders[i].price;
                traderBalances[orders[i].trader][ticker] -= matched;
                traderBalances[orders[i].trader][DAI] += matched * orders[i].price;
            }
            nextTradeId++; // 
            i++; // var to interate throguh order book 
            }      
            // handling depletion of liquidity in the order book   
            // prune orders that are totally matched.
            // loop through all orders of the orderbook we will pop them off the list  
            i = 0;
            // while we havent reached the end of our order book 
            // orders filled that have the matching amount are popped off the stack
            while(i < orders.length && orders[i].filled == orders[i].amount) { 
                 for(uint j = i; j < orders.length - 1; j++) {
                     orders[j] = orders[j + 1]; 
                 }   
                orders.pop(); // remove the last item of the array 
                i++;
            }                
        }
    


    modifier daiNotAllowed(bytes32 ticker) {
        require(ticker != DAI, "cannot trade DAI");
        _;
    }

    modifier tokenExist(bytes32 ticker) {
        require(
            tokens[ticker].tokenAddress != address(0),
            "this token does not exist"
        );
        _;
    }

    modifier onlyAdmin() { // only the owner of the contract can execute
        require(msg.sender == admin, 'only admin');
        _;
    }

}

