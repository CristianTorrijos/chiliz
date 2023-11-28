// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

interface IStaking {
    struct UserInfo {
        uint256 amount;
    }

    function userInfo(address _token, address _user) external view returns (UserInfo memory);
}

interface IAddressOracle {
    function getContractAddress(string calldata _name) external view returns (address);
}

contract Survey is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    struct SurveyInfo {
        address token;
        string question;
        mapping(uint256 => string) options;
        mapping(address => uint256) responses;
        mapping(address => uint256) votePower;
        uint256[] totalVotes;
        uint256 numOptions;
        bool active;
    }

    IAddressOracle public addressOracle;
    mapping(uint256 => SurveyInfo) public surveys;
    uint256 public surveyCount;

    event SurveyCreated(uint256 surveyId, string question);
    event SurveyAnswered(uint256 surveyId, address voter, uint256 option);
    event SurveyClosed(uint256 surveyId);

    function initialize(IAddressOracle _addressOracle) public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        addressOracle = _addressOracle;
    }

    function setAddressOracle(IAddressOracle _addressOracle) external onlyOwner {
        addressOracle = _addressOracle;
    }

    function createSurvey(address _token, string memory _question, string[] memory _options) external onlyOwner {
        uint256 surveyId = surveyCount++;
        SurveyInfo storage survey = surveys[surveyId];
        survey.token = _token;
        survey.question = _question;
        survey.active = true;
        survey.numOptions = _options.length;
        survey.totalVotes = new uint256[](_options.length);

        for (uint256 i = 0; i < _options.length; i++) {
            survey.options[i] = _options[i];
            survey.totalVotes[i] = 0;
        }

        emit SurveyCreated(surveyId, _question);
    }


    function getSurveyOption(uint256 _surveyId, uint256 _optionIndex) public view returns (string memory) {
        return surveys[_surveyId].options[_optionIndex];
    }

    function hasVoted(uint256 _surveyId, address _user) public view returns (bool) {
        return surveys[_surveyId].votePower[_user] > 0;
    }

    function answerSurvey(uint256 _surveyId, uint256 _option) external {
        SurveyInfo storage survey = surveys[_surveyId];
        require(survey.active, "Survey not active");
        require(_option < survey.numOptions, "Invalid option");
        require(!hasVoted(_surveyId, msg.sender), "User has already voted");

        IStaking stakingContract = IStaking(addressOracle.getContractAddress("staking"));

        require(stakingContract.userInfo(survey.token, msg.sender).amount > 0, "Must stake to participate");

        uint256 userTokenBalance = stakingContract.userInfo(surveys[_surveyId].token, msg.sender).amount;
        require(userTokenBalance > 0, "Must have tokens to vote");

        surveys[_surveyId].responses[msg.sender] = _option;
        surveys[_surveyId].votePower[msg.sender] = userTokenBalance;
        surveys[_surveyId].totalVotes[_option] += userTokenBalance;

        emit SurveyAnswered(_surveyId, msg.sender, _option);
    }

    function getUserResponse(uint256 _surveyId, address _user) public view returns (uint256) {
        return surveys[_surveyId].responses[_user];
    }

    function closeSurvey(uint256 _surveyId) external onlyOwner {
        require(surveys[_surveyId].active, "Survey not active");
        surveys[_surveyId].active = false;
        emit SurveyClosed(_surveyId);
    }

    function getSurveyResults(uint256 _surveyId) public view returns (uint256[] memory) {
        SurveyInfo storage survey = surveys[_surveyId];
        uint256[] memory results = new uint256[](survey.numOptions);

        for (uint256 i = 0; i < survey.numOptions; i++) {
            results[i] = surveys[_surveyId].totalVotes[i];
        }

        return results;
    }

}
