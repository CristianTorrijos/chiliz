# Hardhat Smart Contract Project for BAR Token
### By Cristian Torrijos Lázaro (c@cristian.pro)

## Project Overview
This Hardhat project is designed to manage a platform where users can stake their BAR tokens (ERC20) to participate in and vote on different surveys. It leverages upgradeable smart contracts to ensure adaptability and long-term maintainability.

## Getting Started

### Prerequisites
- Node.js must be installed on your machine.

### Installation
1. Clone the repository and navigate to the project directory.
2. Install the required dependencies:
   ```bash
   yarn
   ```
Or, if you prefer npm:
```bash
npm install
```

### Running the Project
Compile the smart contracts:
```bash
yarn hardhat compile
```

Generate typechain:
```bash
yarn hardhat typechain
```

Run tests to ensure everything is set up correctly:
```bash
yarn hardhat test
```

### Deployment
To deploy the contracts to a network, update the hardhat.config.js with your network details and run:

```bash
yarn hardhat run scripts/deploy.js --network <your-network>
```

### Features

- **BAR Token**: ERC20 Token.
- **Staking**: Users can stake BAR tokens.
- **Survey**: Staked tokens allow users to vote in surveys.
- **AddressOracle**: Smart Contracts address book.
- **Upgradeability**: Smart contracts are upgradeable for future improvements.
