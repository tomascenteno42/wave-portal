// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./K42.sol";

contract WavePortal {
    K42 private k42;
    address private owner;

    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }

    struct BiggestWaver {
        address wallet;
        uint256 waves;
    }
    uint256 private immutable amount = 1 * 10**18;
    uint256 private totalWaves;
    mapping(address => uint256) private walletWaveMap;

    event NewWave(address indexed from, uint256 timestamp, string message);

    BiggestWaver private biggestWaver = BiggestWaver(address(0), 0);
    Wave[] private waves;

    constructor(K42 token) payable {
        owner = msg.sender;
        k42 = token;
    }

    function wave(string memory _message) public {
        totalWaves += 1;
        walletWaveMap[msg.sender] += 1;

        waves.push(Wave(msg.sender, _message, block.timestamp));

        if (walletWaveMap[msg.sender] > biggestWaver.waves) {
            biggestWaver.wallet = msg.sender;
            biggestWaver.waves = walletWaveMap[msg.sender];

            k42.grantMinterRole(owner);
            k42.mint(msg.sender, amount);
        }

        emit NewWave(msg.sender, block.timestamp, _message);

        require(
            amount >= address(this).balance,
            "Trying to withdraw more money than the contract has."
        );
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }

    function getWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getBiggestWaver() public view returns (BiggestWaver memory) {
        return biggestWaver;
    }
}
