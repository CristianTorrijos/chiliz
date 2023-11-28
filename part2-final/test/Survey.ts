import { expect } from "chai";
import { ethers } from "hardhat";
import { Survey, BarToken, Staking, AddressOracle, TransparentUpgradeableProxy, ProxyAdmin } from "../typechain-types";

describe("Survey Contract", function () {
    let survey: Survey;
    let barToken: BarToken;
    let staking: Staking;
    let addressOracle: AddressOracle;
    let owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const BarToken = await ethers.getContractFactory("BarToken");
        const barTokenImpl = await BarToken.deploy();
        const dataBarToken = BarToken.interface.encodeFunctionData('initialize', ['FC Barcelona', 'BAR']);

        const StakingContract = await ethers.getContractFactory("Staking");
        const stakingImpl = await StakingContract.deploy();
        const dataStaking = StakingContract.interface.encodeFunctionData('initialize', []);

        const AddressOracle = await ethers.getContractFactory("AddressOracle");
        const addressOracleImpl = await AddressOracle.deploy();
        const dataAddressOracle = AddressOracle.interface.encodeFunctionData('initialize', []);

        const proxyAdminFactory = await ethers.getContractFactory("ProxyAdmin");
        const proxyAdmin = await proxyAdminFactory.deploy(owner);

        const BarTokenProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const barTokenProxy = await BarTokenProxy.deploy(barTokenImpl.target, proxyAdmin.target, dataBarToken);
        barToken = BarToken.attach(barTokenProxy.target);

        const StakingProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const stakingProxy = await StakingProxy.deploy(stakingImpl.target, proxyAdmin.target, dataStaking);
        staking = StakingContract.attach(stakingProxy.target);

        const AddressOracleProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const addressOracleProxy = await AddressOracleProxy.deploy(addressOracleImpl.target, proxyAdmin.target, dataAddressOracle);
        addressOracle = AddressOracle.attach(addressOracleProxy.target);

        await addressOracle.setContractAddress('staking', stakingProxy.target)

        const SurveyContract = await ethers.getContractFactory("Survey");
        const surveyImpl = await SurveyContract.deploy();
        const dataSurvey = SurveyContract.interface.encodeFunctionData('initialize', [addressOracle.target]);
        const SurveyProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");
        const surveyProxy = await SurveyProxy.deploy(surveyImpl.target, proxyAdmin.target, dataSurvey);
        survey = SurveyContract.attach(surveyProxy.target);

        await barToken.mint(user1.address, ethers.parseEther("1000"));
        await barToken.mint(user2.address, ethers.parseEther("1000"));
        await barToken.connect(user1).approve(staking.target, ethers.parseEther("1000"));
        await barToken.connect(user2).approve(staking.target, ethers.parseEther("1000"));
        await staking.addTokenStaking(barToken.target);
        await survey.setAddressOracle(addressOracle.target);
    });


    describe("Create Survey", function () {
        it("Should create a new survey", async function () {
            const surveyQuestion = "What is your favorite BAR player?";
            const surveyOptions = ["Ter Stegen", "Lewandowski", "Frenkie de Jong"];
            const tokenAddress = barToken.target;

            await survey.createSurvey(tokenAddress, surveyQuestion, surveyOptions);

            const createdSurvey = await survey.surveys(0);

            expect(createdSurvey.question).to.equal(surveyQuestion);
            expect(createdSurvey.token).to.equal(tokenAddress);
            expect(createdSurvey.numOptions).to.equal(surveyOptions.length);
            for (let i = 0; i < surveyOptions.length; i++) {
                const option = await survey.getSurveyOption(0, i);
                expect(option).to.equal(surveyOptions[i]);
            }
        });
    });


    describe("Answer Survey", function () {
        beforeEach(async function () {
            const surveyQuestion = "What is your favorite name for FC Barcelona?";
            const surveyOptions = ["BAR", "FCB", "FC Barcelona"];
            await survey.createSurvey(barToken.target, surveyQuestion, surveyOptions);

            await staking.connect(user1).stake(barToken.target, ethers.parseEther("100"));
        });

        it("Should allow a user to answer a survey", async function () {
            const surveyId = 0;
            const answerOption = 1;

            await survey.connect(user1).answerSurvey(surveyId, answerOption);

            const userResponse = await survey.getUserResponse(surveyId, user1.address);
            expect(userResponse).to.equal(answerOption);
        });

        it("Should prevent multiple answers from the same user", async function () {
            const surveyId = 0;
            const answerOption = 1;

            await survey.connect(user1).answerSurvey(surveyId, answerOption);

            await expect(
                survey.connect(user1).answerSurvey(surveyId, answerOption)
            ).to.be.revertedWith("User has already voted");
        });
    });


    describe("Survey Results", function () {
        beforeEach(async function () {
            const surveyQuestion = "Barcelona will win the Champions League this year?";
            const surveyOptions = ["Yes", "No"];
            await survey.createSurvey(barToken.target, surveyQuestion, surveyOptions);

            await staking.connect(user1).stake(barToken.target, ethers.parseEther("300"));
            await staking.connect(user2).stake(barToken.target, ethers.parseEther("100"));
        });

        it("Should calculate survey results correctly", async function () {
            const surveyId = 0;
            const answerOptionUser1 = 0;
            const answerOptionUser2 = 1;

            await survey.connect(user1).answerSurvey(surveyId, answerOptionUser1);
            await survey.connect(user2).answerSurvey(surveyId, answerOptionUser2);

            const results = await survey.getSurveyResults(surveyId);

            expect(results[answerOptionUser1]).to.equal(ethers.parseEther("300"));
            expect(results[answerOptionUser2]).to.equal(ethers.parseEther("100"));
        });
    });

    describe("Close Survey", function () {
        it("Should close an active survey", async function () {
            const surveyQuestion = "Best football player of the year?";
            const surveyOptions = ["Lewandowski", "Gavi", "Pedri"];
            const tokenAddress = barToken.target;

            await survey.createSurvey(tokenAddress, surveyQuestion, surveyOptions);

            const surveyId = 0;

            await survey.closeSurvey(surveyId);

            const closedSurvey = await survey.surveys(surveyId);
            expect(closedSurvey.active).to.be.false;
        });
    });
});
