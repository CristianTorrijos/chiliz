import { ethers } from "hardhat";

async function main() {
    /* Deploy AddressOracle */
    const AddressOracle = await ethers.getContractFactory('AddressOracle');
    const addressOracleImplementation = await AddressOracle.deploy();
    await addressOracleImplementation.waitForDeployment();
    const dataAddressOracle = AddressOracle.interface.encodeFunctionData('initialize', []);
    console.log(`Address Oracle deployed to ${addressOracleImplementation.target}`);

    /* Deploy BarToken */
    const BarToken = await ethers.getContractFactory('BarToken');
    const barTokenImplementation = await BarToken.deploy();
    await barTokenImplementation.waitForDeployment();
    const dataBarToken = BarToken.interface.encodeFunctionData('initialize', ['FC Barcelona', 'BAR']);
    console.log(`BarToken deployed to ${barTokenImplementation.target}`);

    /* Deploy Staking */
    const Staking = await ethers.getContractFactory('Staking');
    const stakingImplementation = await Staking.deploy();
    await stakingImplementation.waitForDeployment();
    const dataStaking = Staking.interface.encodeFunctionData('initialize', []);;
    console.log(`Staking deployed to ${stakingImplementation.target}`);

    /* Deploy Survey */
    const Survey = await ethers.getContractFactory('Survey');
    const surveyImplementation = await Survey.deploy();
    await surveyImplementation.waitForDeployment();
    const dataSurvey = Survey.interface.encodeFunctionData('initialize', [addressOracleImplementation.target]);
    console.log(`Survey deployed to ${surveyImplementation.target}`);

    /* Deploy ProxiesDeployer */
    const ProxiesDeployer = await ethers.getContractFactory("ProxiesDeployer");
    const proxiesDeployer = await ProxiesDeployer.deploy(
        addressOracleImplementation.target,
        barTokenImplementation.target,
        stakingImplementation.target,
        surveyImplementation.target,
        dataAddressOracle,
        dataBarToken,
        dataStaking,
        dataSurvey
    );
    await proxiesDeployer.waitForDeployment();
    console.log(`Proxies Deployer deployed to ${proxiesDeployer.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
