/* eslint-disable no-process-exit */
import { ethers } from "hardhat";

const main = async () => {
  const tokenAddress = "0x6951497dE727851203B307b8665d350B5e161F57";
  const [deployer] = await ethers.getSigners();

  const waveContractFactory = await ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy(tokenAddress);

  await waveContract.deployed();

  console.log("Deploying contracts with account: ", deployer.address);
  console.log("WavePortal address: ", waveContract.address);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
