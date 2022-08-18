// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract K42Coin is ERC20, ERC20Burnable, Ownable, AccessControlEnumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor() ERC20("K42Coin", "K42") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());

        _mint(msg.sender, 4200000 * 10**decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(hasRole(MINTER_ROLE, _msgSender()), "Caller is not a minter");
        _mint(to, amount);
    }

    function burn(uint256 amount) public virtual override {
        require(hasRole(BURNER_ROLE, msg.sender), "Caller is not a burner");
        _burn(_msgSender(), amount);
    }
}
