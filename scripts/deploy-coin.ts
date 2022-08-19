import { ethers } from "hardhat";

async function main() {
  const K42Coin = await ethers.getContractFactory("K42");
  const K42 = await K42Coin.deploy();

  await K42.deployed();

  console.log("K42 coin deployed in address: ", K42.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
