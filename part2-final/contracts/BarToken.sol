// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BarToken is Initializable, ERC20Upgradeable, OwnableUpgradeable {
    function initialize(string memory name, string memory symbol) public initializer {
        ERC20Upgradeable.__ERC20_init(name, symbol);
        OwnableUpgradeable.__Ownable_init(msg.sender);
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}
