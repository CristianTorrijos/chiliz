const ethers = require('ethers');

const rpcUrl = 'https://chiliz.publicnode.com/';
const provider = new ethers.JsonRpcProvider(rpcUrl);

const barTokenAddress = '0xFD3C73b3B09D418841dd6Aff341b2d6e3abA433b';
const erc20Abi = require('./abis/CAP20.json');
const barTokenContract = new ethers.Contract(barTokenAddress, erc20Abi, provider);

const addresses = [
    '0x7aeDB836D2aF860B70323BE889712994F747B4B1',
    '0xBdfbb917Ac5526f639698829318a20b77c83837D',
    '0x0b336335d1082d9DFFbCE962431D369D6805875B',
    '0xBEc21bFCcc3D1D1abBAd502c394f0d550bCcCBF7',
    '0x8D46e0e160a49a0089A632fAB94E9a2DDB96760a',
    '0x7aeDB836D2aF860B70323BE889712994F747B4B1',
    '0x22Be8d0A955fa4C1360883eBfA934F3a5A2a82e6',
];

const maxBlockRange = 50000;

async function getRelevantTransfers() {
    const startBlock = await getStartBlockFromTwoYearsAgo();
    //const startBlock = 8303377;
    let endBlock = 'latest';

    if (endBlock === 'latest') {
        endBlock = await provider.getBlockNumber();
    }

    const events = await getTransferEventsInRange(startBlock, endBlock, addresses);

    console.log('Total events found:', events.length);

    return events.map(event => {
        return {
            from: event.args[0],
            to: event.args[1],
            amount: event.args[2].toString(),
            hash: event.transactionHash,
            viewOnScan: 'https://scan.chiliz.com/tx/' + event.transactionHash,
            blockNumber: event.blockNumber,
        };
    });
}

async function getTransferEventsInRange(fromBlock, toBlock, addresses) {
    let allEvents = [];
    let promises = [];

    for (const address of addresses) {
        let currentBlock = fromBlock;

        while (currentBlock < toBlock) {
            let endBlock = Math.min(currentBlock + maxBlockRange, toBlock);

            const filterFrom = barTokenContract.filters.Transfer(address, null);
            const filterTo = barTokenContract.filters.Transfer(null, address);

            promises.push(barTokenContract.queryFilter(filterFrom, currentBlock, endBlock));
            promises.push(barTokenContract.queryFilter(filterTo, currentBlock, endBlock));

            currentBlock = endBlock + 1;
        }
    }

    const results = await Promise.all(promises);
    for (const result of results) {
        allEvents = [...allEvents, ...result];
    }

    return allEvents;
}

async function getStartBlockFromTwoYearsAgo() {
    const currentBlock = await provider.getBlockNumber();
    const blocksPerYear = Math.round((60 * 60 * 24 * 365) / 3);
    const startBlock = currentBlock - (2 * blocksPerYear);

    return startBlock < 0 ? 0 : startBlock;
}

getRelevantTransfers().then(events => {
    console.log('All Transfer Events:');
    console.log(events);
});