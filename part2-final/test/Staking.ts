import { expect } from "chai";
import { ethers } from "hardhat";
import { Staking, BarToken, TransparentUpgradeableProxy, ProxyAdmin } from "../typechain-types";

describe("Staking Contract", function () {
    let staking: Staking;
    let barToken: BarToken;
    let owner, user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        const BarToken = await ethers.getContractFactory("BarToken");
        const barTokenImpl = await BarToken.deploy();
        const dataBarToken = BarToken.interface.encodeFunctionData('initialize', ['FC Barcelona', 'BAR']);

        const StakingContract = await ethers.getContractFactory("Staking");
        const stakingImpl = await StakingContract.deploy();
        const dataStaking = StakingContract.interface.encodeFunctionData('initialize', []);

        const proxyAdminFactory = await ethers.getContractFactory("ProxyAdmin");
        const proxyAdmin = await proxyAdminFactory.deploy(owner);

        const BarTokenProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const barTokenProxy = await BarTokenProxy.deploy(barTokenImpl.target, proxyAdmin.target, dataBarToken);
        barToken = BarToken.attach(barTokenProxy.target);

        const StakingProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const stakingProxy = await StakingProxy.deploy(stakingImpl.target, proxyAdmin.target, dataStaking);

        staking = StakingContract.attach(stakingProxy.target);
        await barToken.mint(user1.address, ethers.parseEther("1000"));
        await staking.addTokenStaking(barToken.target);
    });

    describe("Stake", function () {
        it("Should allow users to stake tokens", async function () {
            await barToken.connect(user1).approve(staking.target, ethers.parseEther("100"));
            await staking.connect(user1).stake(barToken.target, ethers.parseEther("100"));

            const userInfo = await staking.userInfo(barToken.target, user1.address);
            expect(userInfo.toString()).to.equal(ethers.parseEther("100"));
        });
    });

    describe("Unstake", function () {
        it("Should allow users to unstake tokens", async function () {
            await barToken.connect(user1).approve(staking.target, ethers.parseEther("100"));
            await staking.connect(user1).stake(barToken.target, ethers.parseEther("100"));

            await staking.connect(user1).unstake(barToken.target, ethers.parseEther("70"));

            const userInfo = await staking.userInfo(barToken.target, user1.address);
            expect(userInfo.toString()).to.equal(ethers.parseEther("30"));
        });
    });
});
