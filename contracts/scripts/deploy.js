const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ArkaPro with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");
  
  if (balance.eq(0)) {
    console.error("ERROR: Deployer has 0 ETH on Arbitrum Sepolia!");
    console.error("Please fund the deployer address:", deployer.address);
    console.error("You can get Arb Sepolia ETH from: https://faucet.quicknode.com/arbitrum/sepolia");
    process.exit(1);
  }
  
  const ArkaPro = await hre.ethers.getContractFactory("ArkaPro");
  const arkaPro = await ArkaPro.deploy();
  await arkaPro.deployed();
  
  console.log("ArkaPro deployed to:", arkaPro.address);
  
  // Save to bot .env
  const envPath = "/home/ubuntu/Projects/arka/bot/.env";
  let envContent = fs.readFileSync(envPath, "utf8");
  
  if (envContent.includes("ARKA_PRO_CONTRACT=")) {
    envContent = envContent.replace(/ARKA_PRO_CONTRACT=.*/, `ARKA_PRO_CONTRACT=${arkaPro.address}`);
  } else {
    envContent += `\nARKA_PRO_CONTRACT=${arkaPro.address}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log("Contract address saved to bot/.env");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
