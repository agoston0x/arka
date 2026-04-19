require("@nomiclabs/hardhat-ethers");
const fs = require("fs");

const privateKey = fs.readFileSync("/home/ubuntu/.avalanche-cli/key/zane-admin.pk", "utf8").trim();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: [`0x${privateKey}`]
    }
  }
};
