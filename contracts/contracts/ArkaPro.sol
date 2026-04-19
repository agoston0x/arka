// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArkaPro is ERC721, Ownable {
    uint256 public subscriptionPrice = 0.001 ether;
    uint256 private _tokenIdCounter;
    
    mapping(address => uint256) public subscriptionExpiry;
    mapping(address => string) public communityOf; // community created by pro host
    
    event Subscribed(address indexed user, uint256 tokenId, uint256 expiry);
    event CommunityCreated(address indexed host, string name);
    
    constructor() ERC721("Arka Pro", "ARKAPRO") {}
    
    function subscribe() external payable {
        require(msg.value >= subscriptionPrice, "Insufficient payment");
        _tokenIdCounter++;
        _mint(msg.sender, _tokenIdCounter);
        subscriptionExpiry[msg.sender] = block.timestamp + 30 days;
        emit Subscribed(msg.sender, _tokenIdCounter, subscriptionExpiry[msg.sender]);
    }
    
    function isProHost(address user) external view returns (bool) {
        return subscriptionExpiry[user] > block.timestamp;
    }
    
    function createCommunity(string calldata name) external {
        require(subscriptionExpiry[msg.sender] > block.timestamp, "Not a pro host");
        require(bytes(communityOf[msg.sender]).length == 0, "Already created");
        communityOf[msg.sender] = name;
        emit CommunityCreated(msg.sender, name);
    }
    
    function setPrice(uint256 newPrice) external onlyOwner {
        subscriptionPrice = newPrice;
    }
    
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
