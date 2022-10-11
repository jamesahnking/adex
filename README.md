## Demo
[![Multi-signature wallet crypto wallet demo](http://img.youtube.com/vi/YlrdiDPku6M/0.jpg)](http://www.youtube.com/watch?v=YlrdiDPku6M)

## What is A Crypto Dex?
DEX is short for Decentralized Exchange. A DEX is a peer-to-peer marketplace that coordinates the trading of crypto assets between users without an intermediary.

## How does this DEX function?
Before a user can trade, they must transfer tokens to the DEXs wallet. After the transaction is approved, the DEX contract receives the funds from the users wallet. When the users are ready to cash out, they withdraw their funds from the DEX contract.

### The DEX has three main components:
- A user wallet
- A frontend application for the trader to interact with
- A smart contract

### A user can create one of four types of orders:
- A Market Buy Order
- A Market Sell Order
- A Limit Buy Order
- A Limit Sell Order

Usually, a DEX will have several smart contracts, but this project only has one.The DEX trades ERC20 tokens, and DAI is used to quote the price for each crypto asset.

## How does the multiple signature functionality work?
This wallet is a 2-out-of-3 signature Dapp. Each of the 3 addresses can propose and approve transactions. They are allowed one vote per transaction. If a transaction is submitted by one member, two quorum members need to approve the transaction to be processed and released.

The signature, or address, has the right to approve or propose a transaction and transfer of funds.

## What technolgies were used to build and test this dapp?

Solidity, NodeJS, React, Boostrap, and Truffle



