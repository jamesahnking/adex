// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    
/** 
Mock DAI token will be used during deployment as a means to test
*/

contract MyDai is ERC20 {
    constructor() ERC20("DAI","Dai Stablecoin") {}

    function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
}