import fs from "fs";
import path from "path";
import {ethers, formatEther, formatUnits} from "ethers";
import {ethRpc, neededGas} from "../сonfig.js";

export function writeToCSV(address, result) {
    const mainDirPath = process.cwd()
    const filePath = path.join(mainDirPath, 'results.csv')
    const data = `${address},${result}\n`;

    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
        const headers = 'address,result\n';
        fs.writeFileSync(filePath, headers);
    }

    // Записываем данные в файл
    fs.appendFile(filePath, data, (err) => {
        if (err) throw err;
    });
}

export function getRandomIntFromTo(min, max) {
    let delta = max - min;
    return Math.round(min + Math.random() * delta);
}

export async function getGasPrice(address) {
    while (true) {
        try {
            const provider = new ethers.JsonRpcProvider(ethRpc)
            const gas = formatUnits(((await provider.getFeeData()).gasPrice), 'gwei')
            console.log(`${address} gwei сейчас - ${gas}...`)
            if (neededGas > gas) {
                return true;
            }
            console.log(`${address} gwei слишком большой, жду понижения...`)
            await new Promise(resolve => setTimeout(resolve, 30000))
        } catch (e) {
            console.log(`${address} - ошибка ${e}`)
            await new Promise(resolve => setTimeout(resolve, 2000));
            return await getGasPrice(address);
        }
    }
}

