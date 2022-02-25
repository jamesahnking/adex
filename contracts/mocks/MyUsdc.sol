// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    
/** 
Mock USDC toke will be used during deployment as a means to test
*/

contract MyUsdc is ERC20 {

    constructor() ERC20("USDC","USDC Stablecoin") {}

        function faucet(address to, uint amount) external {
    _mint(to, amount);
  }

}