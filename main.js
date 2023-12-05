import {getProof} from "./src/requests.js";
import {getGasPrice, getRandomIntFromTo, writeToCSV} from "./src/others.js";
import {ethers} from "ethers";
import fs from "fs";
import readline from "readline";
import {amount_wallets_in_batch, shuffleWallets, startTimeout, timeout} from "./сonfig.js";

const zkscan = 'https://explorer.zksync.io/tx/'
const rpc = 'https://mainnet.era.zksync.io'

async function read() {
    const array = []
    const readInterface = readline.createInterface({
        input: fs.createReadStream('keys.txt'),
        crlfDelay: Infinity,
    })
    for await (const line of readInterface) {
        array.push(line)
    }
    return array
}

async function startClaim(key) {
    const claim_address = '0x95702a335e3349d197036Acb04BECA1b4997A91a'
    const claim_abi =  [{
        inputs: [{
            internalType: "bytes32[]",
            name: "proof",
            type: "bytes32[]"
        }, {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
        }],
        name: "claim",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }]
    const provider = new ethers.JsonRpcProvider(rpc)
    const wallet = await new ethers.Wallet(key, provider)
    const claim_data = await getProof(wallet.address)
    if (!claim_data) {
        writeToCSV(wallet.address, `нечего клеймить`)
        return
    }
    const timeForSleep = getRandomIntFromTo(...startTimeout)
    console.log(`${wallet.address} - cплю ${timeForSleep} секунд перед началом`)
    await new Promise(resolve => setTimeout(resolve, timeForSleep*1000));
    const [proof, amount] = claim_data;
    try {
        await getGasPrice(wallet.address)
        const contract = new ethers.Contract(claim_address, claim_abi, wallet)
        const tx = await contract.claim(proof, ethers.parseEther(amount.toString()))
        console.log(`${wallet.address} - успешно заклеймил ${amount} zkpepe : ${zkscan}${tx.hash}`)
        writeToCSV(wallet.address, ` успешно заклеймил ${amount} zkpepe`)
        const timeForSleep = getRandomIntFromTo(...timeout)
        console.log(`${wallet.address} - cплю ${timeForSleep} секунд`)
        await new Promise(resolve => setTimeout(resolve, timeForSleep*1000));
    } catch (e) {
        console.log(`${wallet.address} ошибка - ${e}...`)
        writeToCSV(wallet.address, `ошибка - ${e}`)
        return false
    }
}

async function main(){
    console.log(`\n${" ".repeat(32)}автор - https://t.me/iliocka${" ".repeat(32)}\n`);
    const keys = await read()
    if (shuffleWallets) {
        keys.sort(() => Math.random() - 0.5);
    }
    const batches = [];
    for (let i = 0; i < keys.length; i += amount_wallets_in_batch) {
        const batch = keys.slice(i, i + amount_wallets_in_batch);
        batches.push(batch);
    }
    for (const batch of batches) {
        const tasks = []
        for (const key of batch) {
            tasks.push(startClaim(key))
        }
        await Promise.all(tasks)
    }
    console.log('создан файл с результатами - results.csv')
    console.log(`\n${" ".repeat(32)}автор - https://t.me/iliocka${" ".repeat(32)}\n`);
    console.log(`\n${" ".repeat(32)}donate - EVM 0xFD6594D11b13C6b1756E328cc13aC26742dBa868${" ".repeat(32)}\n`)
    console.log(`\n${" ".repeat(32)}donate - trc20 TMmL915TX2CAPkh9SgF31U4Trr32NStRBp${" ".repeat(32)}\n`)
}

await main()
