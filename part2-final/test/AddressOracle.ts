import { expect } from "chai";
import { ethers } from "hardhat";
import { AddressOracle, Staking, Survey, TransparentUpgradeableProxy, ProxyAdmin } from "../typechain-types";

describe("AddressOracle Contract", function () {
    let addressOracle: AddressOracle;
    let staking: Staking;
    let survey: Survey;
    let owner;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();

        const AddressOracle = await ethers.getContractFactory("AddressOracle");
        const addressOracleImpl = await AddressOracle.deploy();
        const dataAddressOracle = AddressOracle.interface.encodeFunctionData('initialize', []);

        const proxyAdminFactory = await ethers.getContractFactory("ProxyAdmin");
        const proxyAdmin = await proxyAdminFactory.deploy(owner);

        const AddressOracleProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const addressOracleProxy = await AddressOracleProxy.deploy(
            addressOracleImpl.target,
            proxyAdmin.target,
            dataAddressOracle
        );
        addressOracle = AddressOracle.attach(addressOracleProxy.target);

        const Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy();

        const Survey = await ethers.getContractFactory("Survey");
        survey = await Survey.deploy();
    });

    it("Should set and get the address for Staking contract", async function () {
        await addressOracle.setContractAddress("Staking", staking.target);
        expect(await addressOracle.getContractAddress("Staking")).to.equal(staking.target);
    });

    it("Should set and get the address for Survey contract", async function () {
        await addressOracle.setContractAddress("Survey", survey.target);
        expect(await addressOracle.getContractAddress("Survey")).to.equal(survey.target);
    });

    it("Should revert if trying to get an address that has not been set", async function () {
        await expect(addressOracle.getContractAddress("NonExistentContract")).to.be.revertedWith("Address not set");
    });
});
