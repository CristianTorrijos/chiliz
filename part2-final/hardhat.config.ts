import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.22",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1
    }
  }
};

export default config;
