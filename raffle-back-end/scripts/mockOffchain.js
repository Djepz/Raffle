const { ethers, network } = require("hardhat");

async function mockKeepers() {
  const raffle = await ethers.getContract("Raffle");
  const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""));
  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(checkData);
  console.log(upkeepNeeded);

  const tx = await raffle.performUpkeep(checkData);
  const txReceipt = await tx.wait(1);
  const requestId = txReceipt.events[1].args.id;
  console.log(`Performed upkeep with RequestId: ${requestId}`);
  if (network.config.chainId == 31337) {
    console.log("here");
    await mockVrf(requestId, raffle);
    console.log("here1");
  } else {
    console.log("No upkeep needed!");
  }
}

async function mockVrf(requestId, raffle) {
  const vrfCoordinator = await ethers.getContract("VRFCoordinatorV2Mock");
  await vrfCoordinator.fulfillRandomWords(requestId, raffle.address);
  const recentWinner = await raffle.getRecentWinner();
  console.log(`The winner is: ${recentWinner}`);
}

mockKeepers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
