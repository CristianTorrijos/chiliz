// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Staking is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;
    }

    struct StakingInfo {
        IERC20 token;
        uint256 tokenSupply;
    }

    mapping (address => StakingInfo) public stakingInfo;
    mapping (address => mapping (address => UserInfo)) public userInfo;
    mapping(address => bool) public stakingExistence;

    event AddTokenStaking(address token);
    event Stake(address indexed user, address indexed tokenAddress, uint256 amount);
    event Unstake(address indexed user, address indexed tokenAddress, uint256 amount);

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
    }

    modifier nonDuplicated(address _token) {
        require(stakingExistence[_token] == false, "this pool already exists");
        _;
    }

    function addTokenStaking(address _token) external onlyOwner nonDuplicated(_token) {
        stakingExistence[_token] = true;
        stakingInfo[_token] = StakingInfo({
            token: IERC20(_token),
            tokenSupply: 0
        });

        emit AddTokenStaking(_token);
    }

    function stake(address _tokenAddress, uint256 _amount) external nonReentrant {
        require(_amount > 0, "The amount must be greater than 0");
        StakingInfo storage pool = stakingInfo[_tokenAddress];
        UserInfo storage user = userInfo[_tokenAddress][msg.sender];

        uint256 balanceBefore = pool.token.balanceOf(address(this));
        pool.token.safeTransferFrom(msg.sender, address(this), _amount);
        _amount = pool.token.balanceOf(address(this)) - balanceBefore;
        user.amount = user.amount + _amount;
        pool.tokenSupply = pool.tokenSupply + _amount;

        emit Stake(msg.sender, _tokenAddress, _amount);
    }

    function unstake(address _tokenAddress, uint256 _amount) external nonReentrant {
        require(_amount > 0, "The amount must be greater than 0");

        StakingInfo storage pool = stakingInfo[_tokenAddress];
        UserInfo storage user = userInfo[_tokenAddress][msg.sender];
        require(user.amount >= _amount, "Unstake more than Staked not allowed");

        user.amount = user.amount - _amount;
        pool.token.safeTransfer(msg.sender, _amount);
        pool.tokenSupply = pool.tokenSupply - _amount;

        emit Unstake(msg.sender, _tokenAddress, _amount);
    }
}