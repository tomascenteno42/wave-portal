/* eslint-disable no-process-exit */
import * as hre from "hardhat";

const main = async () => {
  const [deployer] = await hre.ethers.getSigners();

  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
  const waveContract = await waveContractFactory.deploy();

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
