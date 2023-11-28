import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

contract ProxiesDeployer {
    ProxyAdmin public proxyAdmin;

    TransparentUpgradeableProxy public addressOracleProxy;
    TransparentUpgradeableProxy public barTokenProxy;
    TransparentUpgradeableProxy public stakingProxy;
    TransparentUpgradeableProxy public surveyProxy;

    constructor(
        address _implementationAddressOracle,
        address _implementationBarToken,
        address _implementationStaking,
        address _implementationSurvey,
        bytes memory _dataAddressOracle,
        bytes memory _dataBarToken,
        bytes memory _dataStaking,
        bytes memory _dataSurvey
    ) {
        proxyAdmin = new ProxyAdmin(msg.sender);

        addressOracleProxy = new TransparentUpgradeableProxy(_implementationAddressOracle, address(proxyAdmin), _dataAddressOracle);
        barTokenProxy = new TransparentUpgradeableProxy(_implementationBarToken, address(proxyAdmin), _dataBarToken);
        stakingProxy = new TransparentUpgradeableProxy(_implementationStaking, address(proxyAdmin), _dataStaking);
        surveyProxy = new TransparentUpgradeableProxy(_implementationSurvey, address(proxyAdmin), _dataSurvey);
    }
}
