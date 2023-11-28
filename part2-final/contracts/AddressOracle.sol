// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract AddressOracle is OwnableUpgradeable {
    mapping(string => address) private contractAddresses;

    event ContractAddressUpdated(string contractName, address contractAddress);

    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    function setContractAddress(string memory _name, address _address) public onlyOwner {
        require(_address != address(0), "Invalid address");
        contractAddresses[_name] = _address;
        emit ContractAddressUpdated(_name, _address);
    }

    function getContractAddress(string memory _name) public view returns (address) {
        require(contractAddresses[_name] != address(0), "Address not set");
        return contractAddresses[_name];
    }
}
