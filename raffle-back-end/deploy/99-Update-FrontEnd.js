const fs = require("fs");
const { network, ethers } = require("hardhat");

const FRONTEND_ADDRESSES_FILE =
  "../raffle-front-end/constants/contractAddresses.json";
const FRONTEND_ABI_FILE = "../raffle-front-end/constants/abi.json";

module.exports = async function () {
  const raffle = await ethers.getContract("Raffle");
  if (process.env.UPDATE_FRONTEND) {
    updateContractAddresses(raffle);
    updateABI(raffle);
    console.log("Front end written!");
  }
};

async function updateABI(raffle) {
  fs.writeFileSync(
    FRONTEND_ABI_FILE,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddresses(raffle) {
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONTEND_ADDRESSES_FILE, "utf8")
  );
  if (network.config.chainId.toString() in currentAddresses) {
    if (
      !currentAddresses[network.config.chainId.toString()].includes(
        raffle.address
      )
    ) {
      currentAddresses[network.config.chainId.toString()].push(raffle.address);
    }
  } else {
    currentAddresses[network.config.chainId.toString()] = [raffle.address];
  }
  fs.writeFileSync(FRONTEND_ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

module.exports.tags = ["all", "frontend"];
