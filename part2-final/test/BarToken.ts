import { expect } from "chai";
import { ethers } from "hardhat";
import { BarToken, TransparentUpgradeableProxy, ProxyAdmin } from "../typechain-types";

describe("BarToken Contract", function () {
    let barToken: BarToken;
    let owner, user1;

    beforeEach(async function () {
        [owner, user1] = await ethers.getSigners();

        const BarToken = await ethers.getContractFactory("BarToken");
        const barTokenImpl = await BarToken.deploy();
        const dataBarToken = BarToken.interface.encodeFunctionData('initialize', ['FC Barcelona', 'BAR']);

        const proxyAdminFactory = await ethers.getContractFactory("ProxyAdmin");
        const proxyAdmin = await proxyAdminFactory.deploy(owner);

        const BarTokenProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const barTokenProxy = await BarTokenProxy.deploy(barTokenImpl.target, proxyAdmin.target, dataBarToken);
        barToken = BarToken.attach(barTokenProxy.target);
    });

    describe("Minting Tokens", function () {
        it("Should mint tokens to a user", async function () {
            const mintAmount = ethers.parseEther("100");
            await barToken.mint(user1.address, mintAmount);

            const userBalance = await barToken.balanceOf(user1.address);
            expect(userBalance).to.equal(mintAmount);
        });
    });

    describe("Token Details", function () {
        it("Should return the correct token name and symbol", async function () {
            expect(await barToken.name()).to.equal("FC Barcelona");
            expect(await barToken.symbol()).to.equal("BAR");
        });
    });

    describe("Token Transfers", function () {
        it("should transfer tokens between accounts", async function () {
            const mintAmount = ethers.parseEther("100");
            await barToken.mint(owner.address, mintAmount);

            await barToken.transfer(user1.address, mintAmount);
            const userBalance = await barToken.balanceOf(user1.address);
            expect(userBalance).to.equal(mintAmount);
        });
    });

    describe("Approval and TransferFrom", function () {
        it("should allow an approved account to transfer tokens", async function () {
            const mintAmount = ethers.parseEther("100");
            await barToken.mint(user1.address, mintAmount);

            await barToken.connect(user1).approve(owner.address, mintAmount);
            await barToken.connect(owner).transferFrom(user1.address, owner.address, mintAmount);

            const ownerBalance = await barToken.balanceOf(owner.address);
            expect(ownerBalance).to.equal(mintAmount);
        });
    });
});