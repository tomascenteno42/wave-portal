import * as hre from "hardhat";

const main = async () => {
  const KCAddress = "0x79f4198163c5e87e992f0fc37afa86347c9db014";
  const owner2Address = "0x4875dEa72561e71aF49ab93e691A8aE4D65eE8EB";

  const [owner] = await hre.ethers.getSigners();
  const owner2 = await hre.ethers.getSigner(owner2Address);

  const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");

  const waveContract = await waveContractFactory.deploy(
    KCAddress,
    owner.address
  );
  await waveContract.deployed();

  console.log("Contract deployed to:", waveContract.address);
  console.log("Contract deployed by:", owner.address);

  let contractBalance = await hre.ethers.provider.getBalance(
    waveContract.address
  );
  console.log(
    "Contract balance:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  // const waveCount = await waveContract.getTotalWaves();
  // console.log(waveCount.toNumber());

  // const waveTxn = await waveContract.wave("A message!");
  // await waveTxn.wait();

  contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
  console.log(
    "Contract balance after first message:",
    hre.ethers.utils.formatEther(contractBalance)
  );

  const waveTxn = await waveContract.connect(owner2).wave("Message!");
  await waveTxn.wait(); // Wait for the transaction to be mined

  // const allWaves = await waveContract.getWaves();
  // console.log(allWaves);

  // const biggestWaver = await waveContract.getBiggestWaver();
  // console.log(
  //   `The biggest waver is ${biggestWaver[0]} with a total of ${biggestWaver[1]} waves`
  // );
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
