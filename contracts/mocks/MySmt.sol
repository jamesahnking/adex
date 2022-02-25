// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
    
/** 
Mock SMT toke will be used during deployment as a means to test
*/

contract MySmt is ERC20 {

    constructor() ERC20("SMT","0x token") {}

        function faucet(address to, uint amount) external {
    _mint(to, amount);
  }

}